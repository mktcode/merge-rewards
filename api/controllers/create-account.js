import axios from "axios";
import steem from "steem";
import database from "../database";
import { decimalFloor } from "../../lib/helpers";

require("dotenv").config();

const QUERY_BALANCE_FOR_USER =
  "SELECT (SELECT SUM(rewards) FROM claims WHERE githubUser = ?) as rewards, (SELECT SUM(amount) FROM withdrawals WHERE githubUser = ?) as withdrawals, ROUND(SUM(pendingRewards), 3) as pending FROM claims WHERE githubUser = ?";
const INSERT_WITHDRAWAL =
  "INSERT INTO withdrawals (githubUser, amount, currency, address, memo) VALUES (?, ?, ?, ?, ?)";
const DELETE_WITHDRAWAL = "DELETE FROM withdrawals WHERE id = ?";

export default (req, res) => {
  const githubUser = res.locals.authenticatedGithubUser.login;
  const accountName = req.body.accountName;
  const pubKeys = req.body.pubKeys;

  // get account price from blocktrades
  axios
    .get("https://blocktrades.us/api/v2/estimate-input-amount", {
      params: {
        outputAmount: 1,
        inputCoinType: "sbd",
        outputCoinType: "steem_account_creation"
      }
    })
    .then(response => {
      // add 2 SBD to what blocktrades says
      const accountPrice = Number(response.data.inputAmount) + 2;

      // check account name
      const accountNameError = steem.utils.validateAccountName(accountName);
      if (accountNameError) {
        res.status(400);
        res.send("Error: " + accountNameError);
      } else {
        // check if account name is available
        steem.api.getAccounts([accountName], (error, response) => {
          if (error) {
            res.status(500);
            res.send("Error: Could not check if account name already exists.");
          } else {
            if (response.length) {
              res.status(400);
              res.send("Bad Request: Account name already exists.");
            } else {
              // check githubUser's balance
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
                    if (balance >= accountPrice) {
                      if (
                        pubKeys &&
                        pubKeys.owner &&
                        pubKeys.active &&
                        pubKeys.posting &&
                        pubKeys.memo
                      ) {
                        axios
                          .post("https://blocktrades.us/api/v2/sessions")
                          .then(response => {
                            const session = response.data;
                            axios
                              .post(
                                "https://blocktrades.us/api/v2/simple-api/initiate-trade",
                                {
                                  inputCoinType: "sbd",
                                  outputCoinType: "steem_account_creation",
                                  outputAddress: "blocktrades",
                                  affiliateId:
                                    "b8ac630a-5e6e-4b00-a8a8-46c33cb7488a",
                                  refundAddress: "merge-rewards",
                                  outputMemo: `{"account_name":${accountName},"owner_key":"${
                                    pubKeys.owner
                                  }","active_key":"${
                                    pubKeys.active
                                  }","posting_key":"${
                                    pubKeys.posting
                                  }","memo_key":"${pubKeys.memo}"}`,
                                  sessionToken: session.token
                                }
                              )
                              .then(response => {
                                const transfer = response.data;

                                database.query(
                                  INSERT_WITHDRAWAL,
                                  [
                                    githubUser,
                                    accountPrice,
                                    "steem_account_creation",
                                    "blocktrades",
                                    transfer.inputMemo
                                  ],
                                  (error, result) => {
                                    if (error) {
                                      res.status(500);
                                      res.send(
                                        "Error: Writing to database failed."
                                      );
                                    } else {
                                      const insertId = result.insertId;
                                      steem.broadcast.transfer(
                                        process.env.ACCOUNT_KEY,
                                        "merge-rewards",
                                        transfer.inputAddress,
                                        accountPrice.toFixed(3) + " SBD",
                                        transfer.inputMemo,
                                        (err, result) => {
                                          if (err) {
                                            database.query(DELETE_WITHDRAWAL, [
                                              insertId
                                            ]);
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
                                res.status(500);
                                res.send("Error: Could not initiate trade.");
                              });
                          })
                          .catch(e => {
                            res.status(500);
                            res.json(
                              "Error: Could not create session to initiate trade."
                            );
                          });
                      } else {
                        res.status(400);
                        res.send(
                          "Bad Request: One or all of the public keys for the account are missing."
                        );
                      }
                    } else {
                      res.status(500);
                      res.send(
                        "Error: GitHub user's Merge Rewards balance is not sufficiant."
                      );
                    }
                  }
                }
              );
            }
          }
        });
      }
    })
    .catch(() => {
      res.status(500);
      res.send("Error: Could not fetch current account price.");
    });
};
