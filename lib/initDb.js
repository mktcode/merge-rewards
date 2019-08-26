const steem = require("steem");
const axios = require("axios");
const mysql = require("mysql");
require("dotenv").config({
  path: __dirname + "/../.env"
});

database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const QUERY_BOUNTY = "SELECT id, githubUser FROM bounties WHERE steemTxId = ?";
const QUERY_BOUNTY_DEPOSITS = "SELECT id FROM bountyDeposits WHERE id = ?";
const UPDATE_BOUNTY =
  "UPDATE bounties SET releasedTo = ?, releasedAt = ?, deletedAt = ? WHERE githubUser = ? AND id = ?";
const DELETE_BOUNTY = "DELETE FROM bounties WHERE id = ?";
const QUERY_CLAIM_ID =
  "SELECT id FROM claims WHERE steemUser = ? AND permlink = ?";
const INSERT_BOUNTY =
  "INSERT INTO bounties (steemTxId, githubUser, btcAddress, ltcAddress, ethAddress, xmrAddress, steemAddress, sbdAddress, issueId, issueTitle, issueOwner, issueRepo, issueNum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
const INSERT_DEPOSIT =
  "INSERT INTO bountyDeposits (receivingAddress, sbdAmount, usdAmount, currency, bountyId, txId) VALUES (?, ?, ?, ?, ?, ?)";
const RELEASE_BOUNTY =
  "UPDATE bounties SET releasedTo = ?, releasedAt = ?, claimId = ? WHERE id = ?";
const INSERT_WITHDRAWAL =
  "INSERT INTO withdrawals (githubUser, sbdAmount, usdAmount, currency, address, memo) VALUES (?, ?, ?, ?, ?, ?)";
const QUERY_BOOSTERS = "SELECT * FROM boosters WHERE githubUser = ?";
const UPDATE_BOOSTERS =
  "UPDATE boosters SET strikes = ?, spares = ?, doubles = ?, dices = ? WHERE githubUser = ?";
const INSERT_BOOSTERS =
  "INSERT INTO boosters (strikes, spares, doubles, dices, githubUser) VALUES (?, ?, ?, ?, ?)";

function getHistory(name, from, limit, tries) {
  return new Promise((resolve, reject) => {
    if (tries) {
      steem.api.getAccountHistory(name, from, limit, (error, result) => {
        if (error) {
          console.log(error);
          console.log("FAILED: " + tries + " tries left. Trying...");
          tries--;
          setTimeout(() => {
            getHistory(name, from, limit, tries)
              .then(innerResult => resolve(innerResult))
              .catch(e => reject(e));
          }, 5000);
        } else {
          if (result[result.length - 1][0] === from) {
            const next = from + limit;
            setTimeout(() => {
              getHistory(name, next, limit, tries)
                .then(innerResult => resolve([...result, ...innerResult]))
                .catch(e => reject(e));
            }, 100);
          } else {
            resolve(result);
          }
        }
      });
    } else {
      reject("Failed too often.");
    }
  });
}

function execCommands(commands) {
  if (commands.length) {
    const command = commands.shift();
    const txId = command[1].trx_id;
    const data = JSON.parse(command[1].op[1].json);
    switch (command[1].op[1].id) {
      case "bounty:create":
        console.log("Create bounty on issue:", data.issueId);
        axios
          .post(
            "https://api.github.com/graphql",
            {
              query: `query {
            node(id: "${data.issueId}") {
              ... on Issue {
                title
                closed
                number
                repository {
                  name,
                  owner {
                    login
                  }
                }
              }
            }
          }`
            },
            {
              headers: {
                Authorization: "bearer " + process.env.GITHUB_ACCESS_TOKEN
              }
            }
          )
          .then(response => {
            const issue = response.data.data.node;
            if (issue) {
              database.query(
                INSERT_BOUNTY,
                [
                  txId,
                  data.githubUser,
                  data.addresses.btc,
                  data.addresses.ltc,
                  data.addresses.eth,
                  data.addresses.xmr,
                  data.addresses.steem,
                  data.addresses.sbd,
                  data.issueId,
                  issue.title,
                  issue.repository.owner.login,
                  issue.repository.name,
                  issue.number
                ],
                (error, result) => {
                  if (error) {
                    console.log(error);
                    database.end();
                  } else {
                    if (commands.length) {
                      execCommands(commands);
                    } else {
                      database.end();
                    }
                  }
                }
              );
            } else {
              console.log(
                "Could not find issue " + data.issueId + " on GitHub."
              );
              execCommands(commands);
            }
          })
          .catch(e => console.log(e));
        break;
      case "bounty:deposit":
        console.log("Deposit on bounty:", data.bountySteemTxId);
        database.query(
          QUERY_BOUNTY_ID,
          [data.bountySteemTxId],
          (error, result) => {
            if (error) {
              console.log(error);
              database.end();
            } else {
              if (result.length === 1) {
                const bountyId = result[0].id;
                database.query(
                  INSERT_DEPOSIT,
                  [
                    data.receivingAddress,
                    data.sbdAmount ? data.sbdAmount : 0,
                    data.usdAmount ? data.usdAmount : 0,
                    data.currency,
                    bountyId,
                    data.txId
                  ],
                  (error, result) => {
                    if (error) {
                      console.log(error);
                      database.end();
                    } else {
                      if (commands.length) {
                        execCommands(commands);
                      } else {
                        database.end();
                      }
                    }
                  }
                );
              } else {
                console.log("Bounty not found.");
                database.end();
              }
            }
          }
        );
        break;
      case "bounty:release":
        console.log("Release bounty:", data.bountySteemTxId);
        database.query(
          QUERY_BOUNTY_ID,
          [data.bountySteemTxId],
          (error, result) => {
            if (error) {
              console.log(error);
              database.end();
            } else {
              if (result.length === 1) {
                const bountyId = result[0].id;
                if (data.claim) {
                  database.query(
                    QUERY_CLAIM_ID,
                    [data.claim.steemUser, data.claim.permlink],
                    (error, result) => {
                      if (error) {
                        console.log(error);
                        database.end();
                      } else {
                        if (result.length === 1) {
                          const claimId = result[0].id;
                          database.query(
                            RELEASE_BOUNTY,
                            [
                              data.to,
                              data.date.replace("Z", ""),
                              claimId,
                              bountyId
                            ],
                            (error, result) => {
                              if (error) {
                                console.log(error);
                                database.end();
                              } else {
                                if (commands.length) {
                                  execCommands(commands);
                                } else {
                                  database.end();
                                }
                              }
                            }
                          );
                        } else {
                          console.log("Claim not found.");
                          database.end();
                        }
                      }
                    }
                  );
                } else {
                  database.query(
                    RELEASE_BOUNTY,
                    [data.to, data.date, null, bountyId],
                    (error, result) => {
                      if (error) {
                        console.log(error);
                        database.end();
                      } else {
                        if (commands.length) {
                          execCommands(commands);
                        } else {
                          database.end();
                        }
                      }
                    }
                  );
                }
              } else {
                console.log("Bounty not found.");
                database.end();
              }
            }
          }
        );
        break;
      case "bounty:delete":
        console.log("Delete bounty:", data.bountySteemTxId);
        database.query(
          QUERY_BOUNTY,
          [data.bountySteemTxId],
          (error, result) => {
            if (error) {
              console.log(error);
              database.end();
            } else {
              if (result.length === 1) {
                const bountyId = result[0].id;
                const githubUser = result[0].githubUser;
                database.query(
                  QUERY_BOUNTY_DEPOSITS,
                  [bountyId],
                  (error, result) => {
                    if (error) {
                      console.log(error);
                      database.end();
                    } else {
                      if (result.length) {
                        database.query(
                          UPDATE_BOUNTY,
                          [
                            githubUser,
                            new Date(),
                            new Date(),
                            githubUser,
                            bountyId
                          ],
                          error => {
                            if (error) {
                              console.log(error);
                              database.end();
                            } else {
                              if (commands.length) {
                                execCommands(commands);
                              } else {
                                database.end();
                              }
                            }
                          }
                        );
                      } else {
                        database.query(DELETE_BOUNTY, [bountyId], error => {
                          if (error) {
                            console.log(error);
                            database.end();
                          } else {
                            if (commands.length) {
                              execCommands(commands);
                            } else {
                              database.end();
                            }
                          }
                        });
                      }
                    }
                  }
                );
              } else {
                console.log("Bounty not found.");
                database.end();
              }
            }
          }
        );
        break;
      case "balance:withdraw":
        console.log(`Withdraw: ${data.githubUser}, ${data.amount}`);
        database.query(
          INSERT_WITHDRAWAL,
          [
            data.githubUser,
            data.sbdAmount ? data.sbdAmount : 0,
            data.usdAmount ? data.usdAmount : 0,
            data.currency,
            data.address,
            data.memo
          ],
          error => {
            if (error) {
              console.log(error);
              database.end();
            } else {
              if (commands.length) {
                execCommands(commands);
              } else {
                database.end();
              }
            }
          }
        );
        break;
      case "booster:transfer":
        console.log(`Transfer boosters: ${data.from} -> ${data.to}`);
        if (data.from) {
          database.query(QUERY_BOOSTERS, [data.from], error => {
            if (error) {
              console.log(error);
              database.end();
            } else {
              if (result.length) {
                let currentBoosters = result[0];
                database.query(
                  UPDATE_BOOSTERS,
                  [
                    currentBoosters.strikes - data.boosters.strikes,
                    currentBoosters.spares - data.boosters.spares,
                    currentBoosters.doubles - data.boosters.doubles,
                    currentBoosters.dices - data.boosters.dices,
                    data.from
                  ],
                  error => {
                    if (error) {
                      console.log(error);
                      database.end();
                    }
                  }
                );
              } else {
                console.log("From user has no boosters.");
                database.end();
              }
            }
          });
        }
        if (data.to) {
          database.query(QUERY_BOOSTERS, [data.to], error => {
            if (error) {
              console.log(error);
              database.end();
            } else {
              if (result.length) {
                let currentBoosters = result[0];
                database.query(
                  UPDATE_BOOSTERS,
                  [
                    currentBoosters.strikes + data.boosters.strikes,
                    currentBoosters.spares + data.boosters.spares,
                    currentBoosters.doubles + data.boosters.doubles,
                    currentBoosters.dices + data.boosters.dices,
                    data.to
                  ],
                  error => {
                    if (error) {
                      console.log(error);
                      database.end();
                    }
                  }
                );
              } else {
                database.query(
                  INSERT_BOOSTERS,
                  [
                    data.boosters.strikes,
                    data.boosters.spares,
                    data.boosters.doubles,
                    data.boosters.dices,
                    data.to
                  ],
                  error => {
                    if (error) {
                      console.log(error);
                      database.end();
                    }
                  }
                );
              }
            }
          });
        }
        if (data.from || data.to) {
          if (commands.length) {
            execCommands(commands);
          } else {
            database.end();
          }
        }
        break;
      default:
        execCommands(commands);
    }
  }
}

getHistory(process.env.ACCOUNT_NAME, 10000, 10000, 5)
  .then(fullHistoryWithDuplicates => {
    const history = [];
    fullHistoryWithDuplicates.forEach(h => {
      if (
        !history.find(hh => hh[0] === h[0]) &&
        h[1].block >= process.env.STEEM_START_BLOCK
      ) {
        history.push(h);
      }
    });
    const customJson = history.filter(h => h[1].op[0] === "custom_json");
    if (customJson.length) {
      customJson.forEach(cj => {
        console.log(cj[1].trx_id, cj[1].op[1].id, cj[1].op[1].json);
      });
      // execCommands(customJson);
    }
  })
  .catch(e => console.log(e));
