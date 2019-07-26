import database from "../database";
import { decimalFloor } from "../../lib/helpers";

const QUERY_BOUNTIES = "SELECT * FROM bounties ORDER BY createdAt ASC";

export default (req, res) => {
  database.query(QUERY_BOUNTIES, (error, result) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else {
      res.json(result);
    }
  });
};
