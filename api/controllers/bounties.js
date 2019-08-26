import database from "../database";
import { decimalFloor } from "../../lib/helpers";

const QUERY_BOUNTIES =
  "SELECT b.*, SUM(bd.sbdAmount) as sbdBalance, SUM(bd.usdAmount) as usdBalance FROM bounties b LEFT JOIN bountyDeposits bd ON bd.bountyId = b.id WHERE b.deletedAt IS NULL GROUP BY b.id ORDER BY createdAt ASC";

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
