import axios from "axios";
import database from "../database";

const QUERY_BOOSTERS =
  "SELECT strikes, spares, doubles, dices FROM boosters WHERE githubUser = ?";
const UPDATE_BOOSTERS =
  "UPDATE boosters SET strikes = ?, spares = ?, doubles = ?, dices = ? WHERE githubUser = ?";
const INSERT_BOOSTERS =
  "INSERT INTO boosters (strikes, spares, doubles, dices, githubUser) VALUES (?, ?, ?, ?, ?)";

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
                            if (receiverBoostersResult.length === 1) {
                              const receiverBoosters =
                                receiverBoostersResult[0];
                              // update
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
                                        res.status(201);
                                        res.send();
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
                                        res.status(201);
                                        res.send();
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
