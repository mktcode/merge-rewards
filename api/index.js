const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const steemconnect = require("steemconnect");
const crypto = require("crypto");

const steemconnectClient = new steemconnect.Client({
  app: "merge-rewards",
  callbackURL:
    process.env.SC_REDIRECT_URL || "http://localhost:3000/auth/steemconnect",
  scope: ["vote", "comment"]
});

require("dotenv").config();

app.use(express.json());

const getDatabase = () => {
  return JSON.parse(
    fs.readFileSync(process.env.DATABASE, { encoding: "utf-8" })
  );
};

const updateDatabase = database => {
  fs.writeFileSync(process.env.DATABASE, JSON.stringify(database, null, 2));
};

const getAge = createdAt =>
  (new Date().getTime() - new Date(createdAt).getTime()) /
  (60 * 60 * 24 * 1000);

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
  const mergedPRsLastMonth = getMergedPRsLastMonth(user.pullRequests.nodes);
  const repoAge = getAge(repo.createdAt);
  const repoStars = repo.stargazers.totalCount;
  const repoForks = repo.forkCount;
  let points = 0;

  if (userAge > 365) points += 1;
  if (userAge > 365 * 5) points += 2;
  if (mergedPRsLastMonth > 2) points += 1;
  if (mergedPRsLastMonth > 10) points += 2;
  if (repoAge > 90) points += 1;
  if (repoAge > 365) points += 2;
  if (repoStars > 50) points += 1;
  if (repoStars > 250) points += 2;
  if (repoForks > 10) points += 1;
  if (repoForks > 50) points += 2;

  return Math.round((points / 15) * 100);
};

app.post("/github/access-token", (req, res) => {
  let code = req.body.code;
  axios
    .post("https://github.com/login/oauth/access_token", {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      accept: "application/json"
    })
    .then(response => {
      const urlParams = new URLSearchParams(response.data);
      const accessToken = urlParams.get("access_token");
      res.json({ accessToken });
    });
});

app.get("/database", (req, res) => {
  const database = getDatabase();
  res.json(database);
});

app.post("/claim", (req, res) => {
  const pullRequest = req.body.pr;
  const githubAccessToken = req.body.githubAccessToken;
  const steemconnectAccessToken = req.body.steemconnectAccessToken;
  const database = getDatabase();
  const existingPr = database.find(pr => pr.id === pullRequest.id);
  if (existingPr) {
    res.status(400);
    res.send("Bad request: Already claimed rewards for this pull request.");
  } else {
    axios
      .post(
        "https://api.github.com/graphql",
        {
          query: `{
  viewer {
    createdAt,
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
      )
      .then(response => {
        const repo = response.data.data.repository;
        const user = response.data.data.viewer;

        if (repo.pullRequest.merged) {
          if (!repo.viewerCanAdminister) {
            steemconnectClient.setAccessToken(steemconnectAccessToken);
            steemconnectClient.me((error, steemUser) => {
              if (error) {
                res.status(400);
                res.send(
                  `Bad request: Unable to connect to steem: ${
                    error.error_description
                  }`
                );
              } else {
                const score = calculateScore(repo, user);
                const permlink = crypto
                  .createHash("md5")
                  .update(repo.pullRequest.permalink)
                  .digest("hex");
                steemconnectClient.comment(
                  "merge-rewards",
                  "merge-rewards-beta-root-post",
                  steemUser.user,
                  permlink,
                  "PR: " + repo.pullRequest.permalink,
                  "PR: " + `${repo.pullRequest.permalink} (Score: ${score})`,
                  { score, prId: repo.pullRequest.id },
                  (error, response) => {
                    if (error) {
                      res.status(400);
                      res.send(`Error: Posting to STEEM blockchain failed.`);
                    } else {
                      database.push({
                        id: repo.pullRequest.id,
                        score,
                        permlink
                      });
                      updateDatabase(database);
                      res.status(201);
                      res.send(`Pull request accepted: Score: ${score}`);
                    }
                  }
                );
              }
            });
          } else {
            res.status(400);
            res.send(
              "Bad request: Unmet requirements: Pull request is for your own repository."
            );
          }
        } else {
          res.status(400);
          res.send(
            "Bad request: Unmet requirements: Pull request is not merged."
          );
        }
      });
  }
});

module.exports = {
  path: "/api",
  handler: app
};