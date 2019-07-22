import database from "../database";
import { decimalFloor } from "../helpers";

const QUERY_BOOSTERS_FOR_USER =
  "SELECT strikes, spares, doubles, dices FROM boosters WHERE githubUser = ?";

export default (req, res) => {
  const githubUser = req.params.githubUser;
  database.query(QUERY_BOOSTERS_FOR_USER, [githubUser], (error, result) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else if (result.length === 1) {
      res.json(result[0]);
    } else {
      res.json({ strikes: 0, spares: 0, doubles: 0, dices: 0 });
    }
  });
};
