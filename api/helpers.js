import axios from "axios";

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

const calculateScore = (repo, user) => {
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

  return Math.round((points / 30) * 100);
};

const getPullRequest = (pullRequest, githubAccessToken) => {
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
repository(owner: "${pullRequest.repository.owner.login}", name: "${
        pullRequest.repository.name
      }") {
  name
  createdAt
  forkCount
  viewerCanAdminister
  stargazers {
    totalCount
  }
  pullRequest(number: ${pullRequest.number}) {
    id
    merged
    mergedAt
    permalink
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
  getPullRequest
};
