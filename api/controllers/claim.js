import crypto from "crypto";
import steemconnect from "steemconnect";
import database from "../database";
import { getPullRequest, calculateScore, getAge } from "../helpers";

require("dotenv").config();

const steemconnectClient = new steemconnect.Client({
  app: "merge-rewards",
  callbackURL:
    process.env.SC_REDIRECT_URL || "http://localhost:3000/auth/steemconnect",
  scope: ["vote", "comment"]
});

const QUERY_EXISTING_PULL_REQUEST =
  "SELECT id FROM claims WHERE pullRequestId = ?";
const INSERT_CLAIM =
  "INSERT INTO claims (pullRequestId, score, permlink, githubUser, steemUser, pendingRewards, rewards) VALUES (?, ?, ?, ?, ?, ?, ?)";
const DELETE_CLAIM = "DELETE FROM claims WHERE pullRequestId = ?";

export default (req, res) => {
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
};
