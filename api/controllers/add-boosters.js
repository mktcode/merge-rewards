import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";
import database from "../database";

const INSERT_BOOSTERS =
  "INSERT INTO boosters (githubUser, strikes, spares, doubles, dices) VALUES (?, ?, ?, ?, ?)";
const UPDATE_BOOSTERS =
  "UPDATE boosters SET strikes = ?, spares = ?, doubles = ?, dices = ? WHERE githubUser = ?";
const QUERY_BOOSTERS = "SELECT * FROM boosters WHERE githubUser = ?";

export default (req, res) => {
  const githubUser = res.locals.authenticatedGithubUser.login;
  const orderId = req.body.orderId;
  const boosters = req.body.boosters;
  const price = req.body.price;

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
      if (order.result.purchase_units[0].amount.value !== price) {
        res.status(400);
        res.send("Bad Request: Payed amount differs from expected amount.");
      } else {
        database.query(QUERY_BOOSTERS, [githubUser], (error, result) => {
          if (error) {
            res.status(500);
            res.send("Error: Reading from database failed.");
          } else {
            if (result.length) {
              const current = result[0];
              database.query(
                UPDATE_BOOSTERS,
                [
                  boosters.strikes + current.strikes,
                  boosters.spares + current.spares,
                  boosters.doubles + current.doubles,
                  boosters.dices + current.dices,
                  githubUser
                ],
                error => {
                  if (error) {
                    console.log(error);
                    res.status(500);
                    res.send("Error: Failed to write to database.");
                  } else {
                    res.status(201);
                    res.send();
                  }
                }
              );
            } else {
              database.query(
                INSERT_BOOSTERS,
                [
                  githubUser,
                  boosters.strikes,
                  boosters.spares,
                  boosters.doubles,
                  boosters.dices
                ],
                error => {
                  if (error) {
                    res.status(500);
                    res.send("Error: Failed to write to database.");
                  } else {
                    res.status(201);
                    res.send();
                  }
                }
              );
            }
          }
        });
      }
    })
    .catch(e => {
      res.status(500);
      res.send("Could not confirm payment.");
    });
};
