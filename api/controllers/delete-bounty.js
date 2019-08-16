import axios from "axios";
import steem from "steem";
import database from "../database";

const QUERY_BOUNTY =
  "SELECT id, steemTxId FROM bounties WHERE githubUser = ? AND id = ?";
const QUERY_BOUNTY_DEPOSITS =
  "SELECT COUNT(id) as count FROM bountyDeposits WHERE bountyId = ?";
const UPDATE_BOUNTY =
  "UPDATE bounties SET releasedTo = ?, releasedAt = ?, deletedAt = ? WHERE githubUser = ? AND id = ?";
const DELETE_BOUNTY = "DELETE FROM bounties WHERE githubUser = ? AND id = ?";

const writeDeleteBountyCustomJson = bountySteemTxId => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      process.env.ACCOUNT_KEY,
      [],
      [process.env.ACCOUNT_NAME],
      "bounty:delete",
      JSON.stringify({ bountySteemTxId }),
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
  const bountyId = req.body.bountyId;

  database.query(QUERY_BOUNTY, [githubUser, bountyId], (error, result) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else if (result.length !== 1) {
      res.status(400);
      res.send("Bad Request: Bounty does not exist.");
    } else {
      const bountySteemTxId = result[0].steemTxId;
      // look for existing deposits
      database.query(QUERY_BOUNTY_DEPOSITS, [bountyId], (error, results) => {
        if (error) {
          res.status(500);
          res.send("Error: Reading from database failed.");
        } else {
          writeDeleteBountyCustomJson(bountySteemTxId)
            .then(() => {
              if (results[0].count) {
                // release bounty to owner and set deletedAt flag
                database.query(
                  UPDATE_BOUNTY,
                  [githubUser, new Date(), new Date(), githubUser, bountyId],
                  error => {
                    if (error) {
                      res.status(500);
                      res.send("Error: Writing to database failed.");
                    } else {
                      res.status(204);
                      res.send();
                    }
                  }
                );
              } else {
                // actually delete bounty
                database.query(DELETE_BOUNTY, [githubUser, bountyId], error => {
                  if (error) {
                    res.status(500);
                    res.send("Error: Deleting from database failed.");
                  } else {
                    res.status(204);
                    res.send();
                  }
                });
              }
            })
            .catch(e => {
              console.log(e);
              res.status(500);
              res.send("Error: Writing to Steem blockchain failed.");
            });
        }
      });
    }
  });
};
