import database from "../database";
import { decimalFloor } from "../../lib/helpers";

const QUERY_BALANCE_FOR_USER =
  "SELECT currency, incoming - outgoing AS balance FROM balances WHERE account = ?";

export default (req, res) => {
  const account = req.params.account;
  database.query(QUERY_BALANCE_FOR_USER, [account], (error, result) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else {
      const balance = result.reduce(
        (balance, item) => {
          if (item.currency === "USD") balance.usd = item.balance;
          if (item.currency === "EUR") balance.eur = item.balance;
          if (item.currency === "SBD") balance.sbd = item.balance;
          return balance;
        },
        { usd: 0, eur: 0, sbd: 0 }
      );
      res.json(balance);
    }
  });
};
