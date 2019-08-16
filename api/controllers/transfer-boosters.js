// TODO: avoid code duplication

import axios from "axios";
import steem from "steem";
import database from "../database";

const QUERY_BOOSTERS =
  "SELECT strikes, spares, doubles, dices FROM boosters WHERE githubUser = ?";
const UPDATE_BOOSTERS =
  "UPDATE boosters SET strikes = ?, spares = ?, doubles = ?, dices = ? WHERE githubUser = ?";
const INSERT_BOOSTERS =
  "INSERT INTO boosters (strikes, spares, doubles, dices, githubUser) VALUES (?, ?, ?, ?, ?)";

const writeBoosterTransferCustomJson = (boosters, from, to) => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      process.env.ACCOUNT_KEY,
      [],
      [process.env.ACCOUNT_NAME],
      "booster:transfer",
      JSON.stringify({
        boosters,
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
  });
};

export default (req, res) => {
  const githubUser = res.locals.authenticatedGithubUser.login;
  const receiver = req.body.receiver;
  const boosters = req.body.boosters;

  // check if receiver exists
  axios
    .get("https://api.github.com/users/" + receiver)
    .then(() => {
      // check if githubUser has enough boosters
      database.query(QUERY_BOOSTERS, [githubUser], (error, result) => {
        if (error) {
          res.status(500);
          res.send("Error: Failed reading sender's boosters from database.");
        } else {
          if (result.length === 1) {
            const availableBoosters = result[0];

            if (
              availableBoosters.strikes < boosters.strikes ||
              availableBoosters.spares < boosters.spares ||
              availableBoosters.doubles < boosters.doubles ||
              availableBoosters.dices < boosters.dices
            ) {
              res.status(400);
              res.send("Bad Request: Not enough boosters.");
            } else {
              // check if receiver has existing boosters
              database.query(QUERY_BOOSTERS, [receiver], (error, result) => {
                if (error) {
                  res.status(500);
                  res.send(
                    "Error: Failed reading receiver's boosters from database."
                  );
                } else {
                  const receiverBoostersResult = result;
                  database.beginTransaction(error => {
                    if (error) {
                      res.status(500);
                      res.send("Error: Failed writing boosters to database.");
                    } else {
                      // remove boosters from sender
                      database.query(
                        UPDATE_BOOSTERS,
                        [
                          availableBoosters.strikes - boosters.strikes,
                          availableBoosters.spares - boosters.spares,
                          availableBoosters.doubles - boosters.doubles,
                          availableBoosters.dices - boosters.dices,
                          githubUser
                        ],
                        error => {
                          if (error) {
                            database.rollback();
                            res.status(500);
                            res.send("Error: Failed to send boosters.");
                          } else {
                            // add boosters to receiver (update or insert)
                            if (receiverBoostersResult.length === 1) {
                              const receiverBoosters =
                                receiverBoostersResult[0];
                              database.query(
                                UPDATE_BOOSTERS,
                                [
                                  receiverBoosters.strikes + boosters.strikes,
                                  receiverBoosters.spares + boosters.spares,
                                  receiverBoosters.doubles + boosters.doubles,
                                  receiverBoosters.dices + boosters.dices,
                                  receiver
                                ],
                                error => {
                                  if (error) {
                                    database.rollback();
                                    res.status(500);
                                    res.send(
                                      "Error: Failed to update receiver's boosters."
                                    );
                                  } else {
                                    database.commit(error => {
                                      if (error) {
                                        database.rollback();
                                        res.status(500);
                                        res.send(
                                          "Error: Failed to write to database."
                                        );
                                      } else {
                                        // write custom json
                                        writeBoosterTransferCustomJson(
                                          boosters,
                                          githubUser,
                                          receiver
                                        )
                                          .then(() => {
                                            res.status(201);
                                            res.send();
                                          })
                                          .catch(error => {
                                            // manual revert
                                            database.query(UPDATE_BOOSTERS, [
                                              availableBoosters.strikes +
                                                boosters.strikes,
                                              availableBoosters.spares +
                                                boosters.spares,
                                              availableBoosters.doubles +
                                                boosters.doubles,
                                              availableBoosters.dices +
                                                boosters.dices,
                                              githubUser
                                            ]);
                                            database.query(UPDATE_BOOSTERS, [
                                              availableBoosters.strikes -
                                                boosters.strikes,
                                              availableBoosters.spares -
                                                boosters.spares,
                                              availableBoosters.doubles -
                                                boosters.doubles,
                                              availableBoosters.dices -
                                                boosters.dices,
                                              receiver
                                            ]);
                                            res.status(500);
                                            res.send(
                                              "Error: Failed to write to Steem blockchain."
                                            );
                                          });
                                      }
                                    });
                                  }
                                }
                              );
                            } else {
                              // insert
                              database.query(
                                INSERT_BOOSTERS,
                                [
                                  boosters.strikes,
                                  boosters.spares,
                                  boosters.doubles,
                                  boosters.dices,
                                  receiver
                                ],
                                error => {
                                  if (error) {
                                    database.rollback();
                                    res.status(500);
                                    res.send(
                                      "Error: Failed to insert receiver's boosters."
                                    );
                                  } else {
                                    database.commit(error => {
                                      if (error) {
                                        database.rollback();
                                        res.status(500);
                                        res.send(
                                          "Error: Failed to write to database."
                                        );
                                      } else {
                                        // write custom json
                                        writeBoosterTransferCustomJson(
                                          boosters,
                                          githubUser,
                                          receiver
                                        )
                                          .then(() => {
                                            res.status(201);
                                            res.send();
                                          })
                                          .catch(error => {
                                            // manual revert
                                            database.query(UPDATE_BOOSTERS, [
                                              availableBoosters.strikes +
                                                boosters.strikes,
                                              availableBoosters.spares +
                                                boosters.spares,
                                              availableBoosters.doubles +
                                                boosters.doubles,
                                              availableBoosters.dices +
                                                boosters.dices,
                                              githubUser
                                            ]);
                                            database.query(UPDATE_BOOSTERS, [
                                              availableBoosters.strikes -
                                                boosters.strikes,
                                              availableBoosters.spares -
                                                boosters.spares,
                                              availableBoosters.doubles -
                                                boosters.doubles,
                                              availableBoosters.dices -
                                                boosters.dices,
                                              receiver
                                            ]);
                                            res.status(500);
                                            res.send(
                                              "Error: Failed to write to Steem blockchain."
                                            );
                                          });
                                      }
                                    });
                                  }
                                }
                              );
                            }
                          }
                        }
                      );
                    }
                  });
                }
              });
            }
          } else {
            res.status(400);
            res.send("Bad Request: Not enough boosters.");
          }
        }
      });
    })
    .catch(() => {
      res.status(400);
      res.send("Bad Request: Could not fetch receiving GitHub account.");
    });
};
