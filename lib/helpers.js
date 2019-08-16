import axios from "axios";
import matchAll from "match-all";

const getAge = createdAt =>
  (new Date().getTime() - new Date(createdAt).getTime()) /
  (60 * 60 * 24 * 1000);

const decimalFloor = (num, decimals) => {
  decimals = decimals || 3;
  const re = new RegExp("^-?\\d+(?:.\\d{0," + (decimals || -1) + "})?");
  return Number(num.toString().match(re)[0]);
};

const getMergedPRsLastMonth = pullRequests => {
  const mergedLastMonth = 0;
  pullRequests.forEach(pr => {
    const age = getAge(pr.createdAt);
    if (pr.merged && age <= 30) {
      mergedLastMonth++;
    }
  });
  return mergedLastMonth;
};

const calculateScore = (repo, user, booster) => {
  const userAge = getAge(user.createdAt);
  const userFollowers = user.followers.totalCount;
  const mergedPRsLastMonth = getMergedPRsLastMonth(user.pullRequests.nodes);
  const repoAge = getAge(repo.createdAt);
  const repoStars = repo.stargazers.totalCount;
  const repoForks = repo.forkCount;
  let points = 0;

  if (userAge > 365) points += 2;
  if (userAge > 365 * 5) points += 4;
  if (userFollowers > 50) points += 1;
  if (userFollowers > 1000) points += 2;
  if (mergedPRsLastMonth > 2) points += 2;
  if (mergedPRsLastMonth > 10) points += 4;
  if (repoAge > 90) points += 2;
  if (repoAge > 365) points += 4;
  if (repoStars > 50) points += 1;
  if (repoStars > 250) points += 2;
  if (repoForks > 10) points += 2;
  if (repoForks > 50) points += 4;

  let score = Math.round((points / 30) * 100);

  if (booster === "strikes") {
    score = 100;
  }
  if (booster === "spares") {
    score = 75;
  }
  if (booster === "doubles") {
    score = score * 2;
  }
  if (booster === "dices") {
    score = Math.random() * 100;
  }

  return Math.min(Math.round(score), 100);
};

const getIssuesByPR = (pullRequest, githubAccessToken) => {
  const issues = [];
  let searchText = pullRequest.body;
  pullRequest.commits.nodes.forEach(commit => {
    searchText += "\n" + commit.commit.message;
  });
  let issueNumbers = matchAll(
    searchText,
    /[close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved]\s+#(\d+)/g
  ).toArray();
  issueNumbers = [...new Set(issueNumbers)];
  const issueRequests = [];
  issueNumbers.forEach(num => {
    issueRequests.push(
      axios
        .post(
          "https://api.github.com/graphql",
          {
            query: `query {
            repository(owner: "${pullRequest.repository.owner.login}", name: "${
              pullRequest.repository.name
            }") {
              issue(number: ${num}) {
                id
                closed
                number
                url
              }
            }
          }`
          },
          {
            headers: {
              Authorization: "bearer " + githubAccessToken
            }
          }
        )
        .then(response => {
          if (
            response.data.data.repository &&
            response.data.data.repository.issue &&
            response.data.data.repository.issue.closed
          ) {
            return response.data.data.repository.issue;
          }
          return null;
        })
    );
  });

  return Promise.all(issueRequests);
};

const getPullRequest = (pullRequestId, githubAccessToken) => {
  return axios.post(
    "https://api.github.com/graphql",
    {
      query: `{
viewer {
  login
  createdAt,
  followers {
    totalCount
  }
  pullRequests(first: 100) {
    nodes {
      mergedAt
    }
  }
}
node(id: "${pullRequestId}") {
  ... on PullRequest {
    id
    merged
    mergedAt
    permalink
    body
    commits(first:100) {
      totalCount
      nodes {
        commit {
          message
        }
      }
    }
    repository {
      name
      owner {
        login
      }
      createdAt
      forkCount
      viewerCanAdminister
      stargazers {
        totalCount
      }
    }
  }
}
}`
    },
    {
      headers: {
        Authorization: "bearer " + githubAccessToken
      }
    }
  );
};

export {
  getAge,
  decimalFloor,
  getMergedPRsLastMonth,
  calculateScore,
  getPullRequest,
  getIssuesByPR
};
