const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const steemconnect = require("steemconnect");
const steem = require("steem");
const crypto = require("crypto");
const mysql = require("mysql");

const database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const QUERY_ALL_FROM_TABLE = "SELECT * FROM ?? ORDER BY createdAt";
const QUERY_BALANCE_FOR_USER =
  "SELECT (SELECT SUM(rewards) FROM claims WHERE githubUser = ?) as rewards, (SELECT SUM(amount) FROM withdrawals WHERE githubUser = ?) as withdrawals, ROUND(SUM(pendingRewards), 3) as pending FROM claims WHERE githubUser = ?";
const QUERY_EXISTING_PULL_REQUEST =
  "SELECT id FROM claims WHERE pullrequestId = ?";
const INSERT_WITHDRAWAL =
  "INSERT INTO withdrawals (githubUser, amount, currency, address, memo) VALUES (?, ?, ?, ?, ?)";
const DELETE_WITHDRAWAL = "DELETE FROM withdrawals WHERE id = ?";
const INSERT_CLAIM =
  "INSERT INTO claims (pullrequestID, score, permlink, githubUser, steemUser, pendingRewards, rewards) VALUES (?, ?, ?, ?, ?, ?, ?)";
const DELETE_CLAIM = "DELETE FROM claims WHERE pullrequestId = ?";

const steemconnectClient = new steemconnect.Client({
  app: "merge-rewards",
  callbackURL:
    process.env.SC_REDIRECT_URL || "http://localhost:3000/auth/steemconnect",
  scope: ["vote", "comment"]
});

require("dotenv").config();

app.use(express.json());

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

app.get("/database/:table", (req, res) => {
  database.query(QUERY_ALL_FROM_TABLE, [req.params.table], (error, results) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else {
      res.json(results);
    }
  });
});

app.get("/balance/:githubUser", (req, res) => {
  const githubUser = req.params.githubUser;
  database.query(
    QUERY_BALANCE_FOR_USER,
    [githubUser, githubUser, githubUser],
    (error, result) => {
      if (error || result.length !== 1) {
        res.status(500);
        res.send("Error: Reading from database failed.");
      } else {
        res.json({
          balance: decimalFloor(
            Number(result[0].rewards) - Number(result[0].withdrawals)
          ),
          pending: decimalFloor(Number(result[0].pending))
        });
      }
    }
  );
});

app.post("/withdraw", (req, res) => {
  const githubUser = req.body.githubUser;
  const amount = req.body.amount;
  const formattedAmount = decimalFloor(amount).toFixed(3) + " SBD";
  const currency = req.body.currency;
  const address = req.body.address;
  database.query(
    QUERY_BALANCE_FOR_USER,
    [githubUser, githubUser, githubUser],
    (error, result) => {
      if (error || result.length !== 1) {
        res.status(500);
        res.send("Error: Reading from database failed.");
      } else {
        const balance = decimalFloor(
          Number(result[0].rewards) - Number(result[0].withdrawals)
        );
        if (balance >= amount) {
          if (["btc", "ltc", "eth", "xmr"].includes(currency)) {
            if (amount >= 3) {
              axios
                .post("https://blocktrades.us/api/v2/sessions")
                .then(response => {
                  const session = response.data;
                  axios
                    .post(
                      "https://blocktrades.us/api/v2/simple-api/initiate-trade",
                      {
                        inputCoinType: "sbd",
                        outputCoinType: currency,
                        outputAddress: address,
                        affiliateId: "b8ac630a-5e6e-4b00-a8a8-46c33cb7488a",
                        refundAddress: "merge-rewards",
                        sessionToken: session.token
                      }
                    )
                    .then(response => {
                      const transfer = response.data;

                      database.query(
                        INSERT_WITHDRAWAL,
                        [
                          githubUser,
                          amount,
                          currency,
                          address,
                          transfer.inputMemo
                        ],
                        (error, result) => {
                          if (error) {
                            res.status(500);
                            res.send("Error: Writing to database failed.");
                          } else {
                            const insertId = result.insertId;
                            steem.broadcast.transfer(
                              process.env.ACCOUNT_KEY,
                              "merge-rewards",
                              transfer.inputAddress,
                              formattedAmount,
                              transfer.inputMemo,
                              (err, result) => {
                                if (err) {
                                  database.query(DELETE_WITHDRAWAL, [insertId]);
                                  res.status(500);
                                  res.json(err);
                                } else {
                                  res.status(201);
                                  res.send();
                                }
                              }
                            );
                          }
                        }
                      );
                    })
                    .catch(e => {
                      res.status(400);
                      res.json(e.response.data.error);
                    });
                })
                .catch(e => {
                  res.status(400);
                  res.json(e.response.data.error);
                });
            } else {
              res.status(400);
              res.send("Bad request: Minimum withdrawal amount is 5$.");
            }
          } else if (currency === "steem") {
            // check if account exists
            steem.api.getAccounts([address], (err, response) => {
              if (err) {
                res.status(500);
                res.send("Error: Steem username lookup failed.");
              } else {
                if (response.length === 1) {
                  const memo = "Withdrawal";
                  database.query(
                    INSERT_WITHDRAWAL,
                    [githubUser, amount, currency, address, memo],
                    (error, result) => {
                      if (error) {
                        res.status(500);
                        res.send("Error: Writing to database failed.");
                      } else {
                        const insertId = result.insertId;
                        steem.broadcast.transfer(
                          process.env.ACCOUNT_KEY,
                          "merge-rewards",
                          address,
                          formattedAmount,
                          memo,
                          (err, result) => {
                            if (err) {
                              database.query(DELETE_WITHDRAWAL, [insertId]);
                              res.status(500);
                              res.json(err);
                            } else {
                              res.status(201);
                              res.send();
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  res.status(400);
                  res.send("Bad Request: Steem username does not exist.");
                }
              }
            });
          } else {
            res.status(400);
            res.send("Bad Request: No supported currency was selected.");
          }
        } else {
          res.status(400);
          res.send("Bad Request: Balance not sufficiant.");
        }
      }
    }
  );
});

app.post("/score", (req, res) => {
  const pullRequest = req.body.pr;
  const githubAccessToken = req.body.githubAccessToken;
  getPullRequest(pullRequest, githubAccessToken).then(response => {
    const repo = response.data.data.repository;
    const user = response.data.data.viewer;
    const score = calculateScore(repo, user);
    res.json({ score });
  });
});

app.post("/claim", (req, res) => {
  const pullRequest = req.body.pr;
  const githubAccessToken = req.body.githubAccessToken;
  const steemconnectAccessToken = req.body.steemconnectAccessToken;

  database.query(
    QUERY_EXISTING_PULL_REQUEST,
    [pullRequest.id],
    (error, result) => {
      if (error) {
        res.status(500);
        res.send("Error: Reading from database failed.");
      } else if (result.length === 1) {
        res.status(400);
        res.send("Bad Request: Already claimed rewards for this pull request.");
      } else {
        getPullRequest(pullRequest, githubAccessToken).then(response => {
          const repo = response.data.data.repository;
          const user = response.data.data.viewer;

          if (getAge(repo.pullRequest.mergedAt) <= process.env.PR_MAX_AGE) {
            if (repo.pullRequest.merged) {
              if (!repo.viewerCanAdminister) {
                const score = calculateScore(repo, user);
                const permlink =
                  crypto
                    .createHash("md5")
                    .update(repo.pullRequest.permalink)
                    .digest("hex") + new Date().getTime();
                const title = "PR: " + repo.pullRequest.permalink;
                const body =
                  "PR: " + `${repo.pullRequest.permalink} (Score: ${score})`;
                const jsonMetadata = { app: "merge-rewards.com" };
                const claimData = [
                  repo.pullRequest.id,
                  score,
                  permlink,
                  user.login,
                  "merge-rewards",
                  null,
                  null
                ];
                if (steemconnectAccessToken) {
                  steemconnectClient.setAccessToken(steemconnectAccessToken);
                  steemconnectClient.me((error, steemUser) => {
                    if (error) {
                      res.status(500);
                      res.send(
                        `Error: Unable to connect to steem: ${
                          error.error_description
                        }`
                      );
                    } else {
                      claimData[4] = steemUser.account.name;
                      database.query(INSERT_CLAIM, claimData, error => {
                        if (error) {
                          res.status(500);
                          res.send("Error: Writing to database failed.");
                        } else {
                          steemconnectClient.comment(
                            "merge-rewards",
                            "merge-rewards-beta-root-post",
                            steemUser.user,
                            permlink,
                            title,
                            body,
                            jsonMetadata,
                            error => {
                              if (error) {
                                database.query(DELETE_CLAIM, [
                                  repo.pullRequest.id
                                ]);
                                res.status(500);
                                res.send(
                                  "Error: Posting to STEEM blockchain failed."
                                );
                              } else {
                                res.status(201);
                                res.send();
                              }
                            }
                          );
                        }
                      });
                    }
                  });
                } else {
                  database.query(INSERT_CLAIM, claimData, error => {
                    if (error) {
                      res.status(500);
                      res.send("Error: Writing to database failed.");
                    } else {
                      steem.broadcast.comment(
                        process.env.ACCOUNT_KEY,
                        "merge-rewards",
                        "merge-rewards-beta-root-post",
                        "merge-rewards",
                        permlink,
                        title,
                        body,
                        jsonMetadata,
                        error => {
                          if (error) {
                            database.query(DELETE_CLAIM, [repo.pullRequest.id]);
                            res.status(500);
                            res.send(
                              "Error: Posting to STEEM blockchain failed."
                            );
                          } else {
                            res.status(201);
                            res.send();
                          }
                        }
                      );
                    }
                  });
                }
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
          } else {
            res.status(400);
            res.send(
              "Bad request: Unmet requirements: Pull request was merged more than " +
                process.env.PR_MAX_AGE +
                " days ago."
            );
          }
        });
      }
    }
  );
});

module.exports = {
  path: "/api",
  handler: app
};
