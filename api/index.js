const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const steemconnect = require("steemconnect");
const crypto = require("crypto");

const steemconnectClient = new steemconnect.Client({
  app: "mkt.test",
  callbackURL: "http://localhost:3000/auth",
  scope: ["vote", "comment"]
});

require("dotenv").config();

app.use(express.json());

const getDatabase = () => {
  return JSON.parse(
    fs.readFileSync(__dirname + "/../database.json", { encoding: "utf-8" })
  );
};

const updateDatabase = database => {
  fs.writeFileSync(
    __dirname + "/../database.json",
    JSON.stringify(database, null, 2)
  );
};

const calculateScore = repo => {
  return 100;
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
  repository(owner: "${pullRequest.repository.owner.login}", name: "${
            pullRequest.repository.name
          }") {
    name
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

        if (repo.pullRequest.merged) {
          const score = calculateScore(repo);
          steemconnectClient.setAccessToken(steemconnectAccessToken);
          steemconnectClient.me((error, steemUser) => {
            if (error) {
              console.log(error);
              res.status(400);
              res.send(
                `Bad request: Unable to connect to steem: ${
                  error.error_description
                }`
              );
            } else {
              const permlink = crypto
                .createHash("md5")
                .update(repo.pullRequest.permalink)
                .digest("hex");
              steemconnectClient.comment(
                "mkt",
                "mobile-optimization-hotfix-for-steem-engine-com",
                steemUser.user,
                permlink,
                "PR: " + repo.pullRequest.permalink,
                "PR: " + repo.pullRequest.permalink,
                null,
                (error, response) => {
                  if (error) {
                    console.log(error);
                    res.status(400);
                    res.send(`Error: Posting to STEEM blockchain failed.`);
                  } else {
                    console.log(response);
                    database.push({
                      id: repo.pullRequest.id,
                      score: score,
                      post: null
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
