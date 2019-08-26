import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";
import steem from "steem";
import database from "../database";

const INSERT_BOUNTY_DEPOSIT =
  "INSERT INTO bountyDeposits (receivingAddress, usdAmount, currency, bountyId, txId) VALUES (?, ?, ?, ?, ?)";
const QUERY_BOUNTY = "SELECT * FROM bounties WHERE id = ?";

const writeCustomJson = (
  receivingAddress,
  usdAmount,
  currency,
  bountySteemTxId,
  txId
) => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      process.env.ACCOUNT_KEY,
      [],
      [process.env.ACCOUNT_NAME],
      "bounty:deposit",
      JSON.stringify({
        receivingAddress,
        usdAmount,
        currency,
        bountySteemTxId,
        txId
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
  const orderId = req.body.orderId;
  const bountyId = req.body.bountyId;
  const amount = req.body.amount;

  let environment;
  if (process.env.PAYPAL_SANDBOX === "no") {
    environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  } else {
    environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_SANDBOX_CLIENT_ID,
      process.env.PAYPAL_SANDBOX_CLIENT_SECRET
    );
  }
  const paypalClient = new paypal.core.PayPalHttpClient(environment);
  const request = new paypal.orders.OrdersGetRequest(orderId);

  paypalClient
    .execute(request)
    .then(order => {
      if (order.result.purchase_units[0].amount.value !== amount) {
        res.status(400);
        res.send("Bad Request: Payed amount differs from expected amount.");
      } else {
        const amountAfterFees =
          order.result.purchase_units[0].payments.captures[0]
            .seller_receivable_breakdown.net_amount.value;
        database.query(QUERY_BOUNTY, [bountyId], (error, result) => {
          if (error) {
            console.log(error);
            res.status(500);
            res.send("Error: Reading from database failed.");
          } else {
            if (result.length) {
              const bounty = result[0];
              writeCustomJson(
                "paypal",
                amountAfterFees,
                "USD",
                bounty.steemTxId,
                orderId
              )
                .then(() => {
                  database.query(
                    INSERT_BOUNTY_DEPOSIT,
                    ["paypal", amountAfterFees, "USD", bountyId, orderId],
                    error => {
                      if (error) {
                        console.log(error);
                        res.status(500);
                        res.send("Error: Failed to write to database.");
                      } else {
                        res.status(201);
                        res.json(amountAfterFees);
                      }
                    }
                  );
                })
                .catch(e => {
                  console.log(e);
                  res.status(500);
                  res.send("Error: Writing to Steem blockchain failed.");
                });
            } else {
              res.status(400);
              res.send("Bad Request: Bounty not found.");
            }
          }
        });
      }
    })
    .catch(e => {
      console.log(e);
      res.status(500);
      res.send("Error: Could not confirm payment.");
    });
};
