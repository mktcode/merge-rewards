const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();

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
  const pr = req.body.pr;
  const githubAccessToken = req.body.githubAccessToken;
  const database = getDatabase();
  axios
    .post(
      "https://api.github.com/graphql",
      {
        query: `{
  repository(owner: "${pr.repository.owner.login}", name: "${
          pr.repository.name
        }") {
    name
    pullRequest(number: ${pr.number}) {
      id
      merged
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
      const existingPr = database.find(pr => pr.id === repo.pullRequest.id);
      if (!existingPr) {
        if (repo.pullRequest.merged) {
          const score = 100;
          database.push({
            id: repo.pullRequest.id,
            score: score
          });
          updateDatabase(database);
          res.status(201);
          res.send(`Pull request accepted: Score: ${score}`);
        } else {
          res.status(400);
          res.send(
            "Bad request: Unmet requirements: Pull request is not merged."
          );
        }
      } else {
        res.status(400);
        res.send("Bad request: Already claimed rewards for this pull request.");
      }
    });
});

module.exports = {
  path: "/api",
  handler: app
};
