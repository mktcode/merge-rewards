import axios from "axios";
import steem from "steem";
import database from "../database";
import { decimalFloor } from "../helpers";

require("dotenv").config();

const QUERY_BALANCE_FOR_USER =
  "SELECT (SELECT SUM(rewards) FROM claims WHERE githubUser = ?) as rewards, (SELECT SUM(amount) FROM withdrawals WHERE githubUser = ?) as withdrawals, ROUND(SUM(pendingRewards), 3) as pending FROM claims WHERE githubUser = ?";
const INSERT_WITHDRAWAL =
  "INSERT INTO withdrawals (githubUser, amount, currency, address, memo) VALUES (?, ?, ?, ?, ?)";
const DELETE_WITHDRAWAL = "DELETE FROM withdrawals WHERE id = ?";

export default (req, res) => {
  const githubAccessToken = req.body.githubAccessToken;
  const amount = req.body.amount;
  const formattedAmount = decimalFloor(amount).toFixed(3) + " SBD";
  const currency = req.body.currency;
  const address = req.body.address;

  // check github access token
  axios
    .get("https://api.github.com/user", {
      params: { access_token: githubAccessToken }
    })
    .then(response => {
      const githubUser = response.data.login;
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
                if (amount >= 5) {
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
    })
    .catch(() => {
      res.status(400);
      res.send(
        "Bad Request: Could not fetch GitHub user with provided the access token."
      );
    });
};
