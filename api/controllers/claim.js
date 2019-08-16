import axios from "axios";
import crypto from "crypto";
import steemconnect from "steemconnect";
import steem from "steem";
import database from "../database";
import {
  getPullRequest,
  getIssuesByPR,
  calculateScore,
  getAge
} from "../../lib/helpers";

require("dotenv").config();

const steemconnectClient = new steemconnect.Client({
  app: "merge-rewards",
  callbackURL:
    process.env.SC_REDIRECT_URL || "http://localhost:3000/auth/steemconnect",
  scope: ["vote", "comment"]
});

const QUERY_EXISTING_CLAIM = "SELECT id FROM claims WHERE pullRequestId = ?";
const INSERT_CLAIM =
  "INSERT INTO claims (pullRequestId, score, permlink, githubUser, steemUser, booster) VALUES (?, ?, ?, ?, ?, ?)";
const DELETE_CLAIM = "DELETE FROM claims WHERE pullRequestId = ?";
const UPDATE_BOOSTER = "UPDATE boosters SET ?? = ?? - 1 WHERE githubUser = ?";
const QUERY_BOOSTER = "SELECT ?? FROM boosters WHERE githubUser = ?";
const QUERY_BOUNTIES =
  "SELECT id, steemTxId FROM bounties WHERE issueId = ? AND autoRelease = 1";
const RELEASE_BOUNTY =
  "UPDATE bounties SET releasedTo = ?, releasedAt = ?, claimId = ? WHERE autoRelease = 1 AND id = ?";

let customJsonDelay = 0;
const writeBountyReleaseCustomJson = (to, date, claim, bountySteemTxId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      steem.broadcast.customJson(
        process.env.ACCOUNT_KEY,
        [],
        [process.env.ACCOUNT_NAME],
        "bounty:release",
        JSON.stringify({
          to,
          date: date.toISOString(),
          claim,
          bountySteemTxId
        }),
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    }, customJsonDelay);
    customJsonDelay += 1000;
  });
};

const writeBoosterTransferCustomJson = (booster, from, to) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      steem.broadcast.customJson(
        process.env.ACCOUNT_KEY,
        [],
        [process.env.ACCOUNT_NAME],
        "booster:transfer",
        JSON.stringify({
          boosters: { [booster]: 1 },
          from,
          to
        }),
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    }, customJsonDelay);
    customJsonDelay += 1000;
  });
};

const getBoosterCountForGithubUser = (booster, githubUser) => {
  return new Promise((resolve, reject) => {
    if (booster) {
      database.query(QUERY_BOOSTER, [booster, githubUser], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.length === 1 ? result[0][booster] : 0);
        }
      });
    } else {
      resolve(0);
    }
  });
};

const getClaimExists = pullRequestId => {
  return new Promise((resolve, reject) => {
    database.query(QUERY_EXISTING_CLAIM, [pullRequestId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(!!result.length);
      }
    });
  });
};

const getSteemUser = steemconnectAccessToken => {
  if (steemconnectAccessToken) {
    return new Promise((resolve, reject) => {
      steemconnectClient.setAccessToken(steemconnectAccessToken);
      steemconnectClient.me((error, steemUser) => {
        if (error) {
          reject(error);
        } else {
          resolve(steemUser);
        }
      });
    });
  } else {
    return null;
  }
};

const postSteemComment = (steemUser, permlink, title, body, jsonMetadata) => {
  return new Promise((resolve, reject) => {
    if (steemUser) {
      steemconnectClient.comment(
        process.env.ACCOUNT_NAME,
        process.env.ROOT_POST_PERMLINK,
        steemUser.user,
        permlink,
        title,
        body,
        jsonMetadata,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    } else {
      steem.broadcast.comment(
        process.env.ACCOUNT_KEY,
        process.env.ACCOUNT_NAME,
        process.env.ROOT_POST_PERMLINK,
        process.env.ACCOUNT_NAME,
        permlink,
        title,
        body,
        jsonMetadata,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    }
  });
};

export default (req, res) => {
  const githubUser = res.locals.authenticatedGithubUser.login;
  const githubAccessToken = req.body.githubAccessToken;
  const steemconnectAccessToken = req.body.steemconnectAccessToken;
  const pullRequestId = req.body.pullRequestId;
  const booster = req.body.booster;

  // Step 1: Check if requirements are met
  Promise.all([
    getBoosterCountForGithubUser(booster, githubUser),
    getClaimExists(pullRequestId),
    getPullRequest(pullRequestId, githubAccessToken)
  ])
    .then(results => {
      const availableBoosters = results[0];
      const claimExists = results[1];
      const viewer = results[2].data.data.viewer;
      const pullRequest = results[2].data.data.node;
      const repo = pullRequest.repository;
      const tooOld = getAge(pullRequest.mergedAt) > process.env.PR_MAX_AGE;
      const merged = pullRequest.merged;
      const isAdmin = repo.viewerCanAdminister;

      if (booster && !availableBoosters) {
        res.status(400);
        res.send("Bad Request: Booster not available");
      } else if (tooOld) {
        res.status(400);
        res.send(
          "Bad request: Unmet requirements: Pull request was merged more than " +
            process.env.PR_MAX_AGE +
            " days ago."
        );
      } else if (!merged) {
        res.status(400);
        res.send(
          "Bad request: Unmet requirements: Pull request is not merged."
        );
      } else if (isAdmin) {
        res.status(400);
        res.send(
          "Bad request: Unmet requirements: Pull request is for your own repository."
        );
      } else {
        // Step 2: Prepare claim data
        Promise.all([
          getIssuesByPR(pullRequest, githubAccessToken),
          getSteemUser(steemconnectAccessToken)
        ])
          .then(results => {
            const issues = results[0].filter(i => i);
            const steemUser = results[1];
            const score = calculateScore(repo, viewer, booster);
            const permlink =
              crypto
                .createHash("md5")
                .update(pullRequest.permalink)
                .digest("hex") + new Date().getTime();
            const title = "PR: " + pullRequest.permalink;
            const body = "PR: " + `${pullRequest.permalink} (Score: ${score})`;
            const jsonMetadata = { app: "merge-rewards.com" };
            const claimData = [
              pullRequest.id,
              score,
              permlink,
              githubUser,
              steemUser ? steemUser.account.name : process.env.ACCOUNT_NAME,
              booster
            ];
            // Step 3: Write claim to database
            database.query(INSERT_CLAIM, claimData, (error, result) => {
              if (error) {
                console.log(error);
                res.status(500);
                res.send("Error: Writing claim to database failed.");
              } else {
                const claimId = result.insertId;
                // Step 4: Post to Steem blockchain
                postSteemComment(steemUser, permlink, title, body, jsonMetadata)
                  .then(() => {
                    // Step 5: Transfer booster (to null)
                    if (booster) {
                      writeBoosterTransferCustomJson(
                        booster,
                        githubUser,
                        null
                      ).then(() => {
                        database.query(UPDATE_BOOSTER, [
                          booster,
                          booster,
                          githubUser
                        ]);
                      });
                    }
                    // Step 6: Release issue bounties
                    if (issues) {
                      const releaseDate = new Date();
                      issues.forEach(issue => {
                        database.query(
                          QUERY_BOUNTIES,
                          [issue.id],
                          (error, result) => {
                            if (error) {
                              res.status(500);
                              res.send(
                                "Error: Reading bounty from database failed."
                              );
                            } else {
                              result.forEach(bounty => {
                                writeBountyReleaseCustomJson(
                                  githubUser,
                                  releaseDate,
                                  {
                                    steemUser: steemUser
                                      ? steemUser.account.name
                                      : process.env.ACCOUNT_NAME,
                                    permlink
                                  },
                                  bounty.steemTxId
                                ).then(result => {
                                  database.query(RELEASE_BOUNTY, [
                                    githubUser,
                                    releaseDate,
                                    claimId,
                                    bounty.id
                                  ]);
                                });
                              });
                            }
                          }
                        );
                      });
                    }
                    res.status(201);
                    res.send();
                  })
                  .catch(error => {
                    console.log(error);
                    // Step 4.1: Delete claim if commenting failed
                    database.query(DELETE_CLAIM, [pullRequest.id]);
                    res.status(500);
                    res.send("Error: Posting to steem blockchain failed.");
                  });
              }
            });
          })
          .catch(error => {
            console.log(error);
            res.status(500);
            res.send("Error: An unknown error occured.");
          });
      }
    })
    .catch(errors => {
      console.log(errors);
      res.status(500);
      res.send("Error: An unknown error occured.");
    });
};
