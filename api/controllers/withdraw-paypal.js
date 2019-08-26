import paypal from "paypal-rest-sdk";
import axios from "axios";
import steem from "steem";
import database from "../database";
import uuid from "uuid";
import { decimalFloor } from "../../lib/helpers";

require("dotenv").config();

const QUERY_BALANCE_FOR_USER =
  "SELECT (SELECT SUM(rewards) FROM claims WHERE githubUser = ?) as rewards, (SELECT SUM(bd.sbdAmount) as balance FROM bounties b JOIN bountyDeposits bd ON bd.bountyId = b.id WHERE b.releasedTo = ?) as sbdBounties, (SELECT SUM(bd.usdAmount) as balance FROM bounties b JOIN bountyDeposits bd ON bd.bountyId = b.id WHERE b.releasedTo = ?) as usdBounties, (SELECT SUM(sbdAmount) FROM withdrawals WHERE githubUser = ?) as sbdWithdrawals, (SELECT SUM(usdAmount) FROM withdrawals WHERE githubUser = ?) as usdWithdrawals, SUM(pendingRewards) as pending FROM claims WHERE githubUser = ?";
const INSERT_WITHDRAWAL =
  "INSERT INTO withdrawals (githubUser, usdAmount, currency, address, memo) VALUES (?, ?, ?, ?, ?)";
const DELETE_WITHDRAWAL = "DELETE FROM withdrawals WHERE id = ?";

const writeWithdrawCustomJson = (
  githubUser,
  usdAmount,
  currency,
  address,
  memo
) => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      process.env.ACCOUNT_KEY,
      [],
      [process.env.ACCOUNT_NAME],
      "balance:withdraw",
      JSON.stringify({
        githubUser,
        usdAmount,
        currency,
        address,
        memo
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
  const amount = decimalFloor(req.body.amount);
  const address = req.body.address;
  const currency = "USD";

  database.query(
    QUERY_BALANCE_FOR_USER,
    [githubUser, githubUser, githubUser, githubUser, githubUser, githubUser],
    (error, result) => {
      if (error || result.length !== 1) {
        res.status(500);
        res.send("Error: Reading from database failed.");
      } else {
        const balance = decimalFloor(
          Number(result[0].usdBounties) - Number(result[0].usdWithdrawals)
        );
        if (balance >= amount) {
          if (amount >= 2) {
            const batchId = uuid.v4();
            database.query(
              INSERT_WITHDRAWAL,
              [githubUser, amount.toFixed(3), currency, address, batchId],
              (error, result) => {
                if (error) {
                  res.status(500);
                  res.send("Error: Writing to database failed.");
                } else {
                  const insertId = result.insertId;

                  writeWithdrawCustomJson(
                    githubUser,
                    amount.toFixed(2),
                    currency,
                    address,
                    batchId
                  )
                    .then(() => {
                      paypal.configure({
                        mode:
                          process.env.PAYPAL_SANDBOX === "no"
                            ? "live"
                            : "sandbox",
                        client_id:
                          process.env.PAYPAL_SANDBOX === "no"
                            ? process.env.PAYPAL_CLIENT_ID
                            : process.env.PAYPAL_SANDBOX_CLIENT_ID,
                        client_secret:
                          process.env.PAYPAL_SANDBOX === "no"
                            ? process.env.PAYPAL_CLIENT_SECRET
                            : process.env.PAYPAL_SANDBOX_CLIENT_SECRET
                      });

                      const actualAmount = (amount * 0.95).toFixed(2);
                      paypal.payout.create(
                        {
                          sender_batch_header: {
                            sender_batch_id: batchId,
                            email_subject: "Merge Rewards Withdrawal!",
                            email_message:
                              actualAmount +
                              " have been send to your PayPal account! Thanks for using our service!"
                          },
                          items: [
                            {
                              recipient_type: "EMAIL",
                              amount: {
                                value: actualAmount,
                                currency
                              },
                              note: "Thanks for your patronage!",
                              sender_item_id: batchId,
                              receiver: address
                            }
                          ]
                        },
                        (error, payout) => {
                          if (error) {
                            console.log(error);
                            database.query(DELETE_WITHDRAWAL, [insertId]);
                            res.status(500);
                            res.json(error);
                          } else {
                            res.status(201);
                            res.send();
                          }
                        }
                      );
                    })
                    .catch(e => {
                      console.log(e);
                      database.query(DELETE_WITHDRAWAL, [insertId]);
                      res.status(500);
                      res.send("Error: Writing to steem blockchain failed.");
                    });
                }
              }
            );
          } else {
            res.status(400);
            res.send("Bad request: Minimum withdrawal amount is 2 USD.");
          }
        } else {
          res.status(400);
          res.send("Bad Request: Balance not sufficiant.");
        }
      }
    }
  );
};
