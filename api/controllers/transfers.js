import database from "../database";
import { decimalFloor } from "../../lib/helpers";

const QUERY_TRANSFERS_FOR_ACCOUNT =
  "SELECT * FROM transfers WHERE src = ? OR dest = ? ORDER BY timestamp DESC";

export default (req, res) => {
  const account = req.params.account;
  database.query(
    QUERY_TRANSFERS_FOR_ACCOUNT,
    [account, account],
    (error, result) => {
      if (error) {
        res.status(500);
        res.send("Error: Reading from database failed.");
      } else {
        res.json(result);
      }
    }
  );
};
