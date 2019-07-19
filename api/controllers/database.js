import database from "../database";

const QUERY_ALL_FROM_TABLE = "SELECT * FROM ?? ORDER BY createdAt";

export default (req, res) => {
  database.query(QUERY_ALL_FROM_TABLE, [req.params.table], (error, results) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else {
      res.json(results);
    }
  });
};
