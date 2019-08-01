const steem = require("steem");
const helper = require("./helper");
const mysql = require("mysql");
require("dotenv").config({ path: __dirname + "/../.env" });

const database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const QUERY_PENDING_CLAIMS = "SELECT * FROM claims WHERE rewards IS NULL";
const UPDATE_CLAIM =
  "UPDATE claims SET rewards = ?, pendingRewards = ? WHERE id = ?";

database.query(QUERY_PENDING_CLAIMS, (error, claims) => {
  if (error) {
    console.log(error);
    database.end();
  } else {
    console.log("Found " + claims.length + " comments to check.");
    const updates = [];
    claims.forEach(claim => {
      updates.push(
        new Promise(resolve => {
          steem.api.getContent(
            claim.steemUser,
            claim.permlink,
            (error, comment) => {
              if (error) {
                console.log(error);
                resolve();
              } else {
                let rewards = null;
                let pendingRewards = null;
                if (comment.last_payout === "1970-01-01T00:00:00") {
                  // not payed out yet
                  // total payout - 25% curator rewards (* 0.75) and minus SP part (/ 2)
                  pendingRewards = comment.pending_payout_value.split(" ")[0];
                  pendingRewards = (parseFloat(pendingRewards) * 0.75) / 2;
                } else {
                  // payed out, curator rewards are already substracted
                  rewards = comment.total_payout_value.split(" ")[0];
                  rewards = parseFloat(rewards) / 2;
                }
                database.query(
                  UPDATE_CLAIM,
                  [rewards, pendingRewards, claim.id],
                  error => {
                    if (error) {
                      console.log(error);
                    }
                    resolve();
                  }
                );
              }
            }
          );
        })
      );
    });

    Promise.all(updates).finally(() => {
      process.exit();
    });
  }
});
