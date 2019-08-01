const steem = require("steem");
const fs = require("fs");
const mysql = require("mysql");
require("dotenv").config({ path: __dirname + "/../.env" });

const DEBUG = !(process.env.BOT_DEBUG && process.env.BOT_DEBUG === "no");

database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const QUERY_UNVOTED_CLAIMS =
  "SELECT id, score, steemUser, permlink, createdAt FROM claims WHERE votedAt IS NULL AND createdAt > DATE_SUB(NOW(), INTERVAL 24 * 6.5 hour) ORDER BY createdAt ASC";
const UPDATE_CLAIM_VOTE =
  "UPDATE claims SET votedAt = NOW(), vote = ? WHERE id = ?";

const helper = {
  getVoteWeightForScore(score, maxVoteWeight) {
    return (score * maxVoteWeight) / 100;
  },
  calcRecoveryTime(percentage) {
    return percentage * 72;
  },
  getCurrentVotingPower(account, humanReadable = false) {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([account], (err, accounts) => {
        if (!err) {
          const status = accounts[0];

          const secondsAgo =
            (new Date().getTime() -
              new Date(status.last_vote_time + "Z").getTime()) /
            1000;
          let votingPower = status.voting_power + (10000 * secondsAgo) / 432000;
          votingPower = votingPower > 10000 ? 10000 : votingPower;

          if (humanReadable) votingPower /= 100;

          resolve(votingPower);
        } else {
          reject(err);
        }
      });
    });
  },
  getPostsWaitingForUpvote() {
    return new Promise((resolve, reject) => {
      database.query(QUERY_UNVOTED_CLAIMS, (error, claims) => {
        if (error) {
          reject(error);
        } else {
          resolve(claims);
        }
      });
    });
  },
  isVoted(author, permlink, voterAccount) {
    return new Promise((resolve, reject) => {
      steem.api.getActiveVotes(author, permlink, function(err, activeVotes) {
        if (!err) {
          let voted = false;
          for (let i = 0; i < activeVotes.length; i++) {
            if (activeVotes[i].voter === voterAccount) {
              voted = true;
            }
          }
          resolve(voted);
        } else {
          reject(err);
        }
      });
    });
    return voted;
  },
  upvotePost(voter, key, author, permlink, weight) {
    return new Promise((resolve, reject) => {
      this.isVoted(author, permlink, voter).then(isVoted => {
        if (!isVoted) {
          if (!DEBUG) {
            steem.broadcast.vote(
              key,
              voter,
              author,
              permlink,
              weight,
              (err, result) => {
                if (!err) {
                  resolve(result);
                } else {
                  reject(err);
                }
              }
            );
          } else {
            resolve();
          }
        } else {
          console.log("Already voted on " + author + "/" + permlink);
        }
      });
    });
  },
  updateClaimVote(id, vote) {
    return new Promise((resolve, reject) => {
      database.query(UPDATE_CLAIM_VOTE, [vote, id], error => {
        if (error) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
};

module.exports = helper;
