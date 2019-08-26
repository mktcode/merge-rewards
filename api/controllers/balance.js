import database from "../database";
import { decimalFloor } from "../../lib/helpers";

const QUERY_BALANCE_FOR_USER =
  "SELECT (SELECT SUM(rewards) FROM claims WHERE githubUser = ?) as rewards, (SELECT SUM(bd.sbdAmount) as balance FROM bounties b JOIN bountyDeposits bd ON bd.bountyId = b.id WHERE b.releasedTo = ?) as sbdBounties, (SELECT SUM(bd.usdAmount) as balance FROM bounties b JOIN bountyDeposits bd ON bd.bountyId = b.id WHERE b.releasedTo = ?) as usdBounties, (SELECT SUM(sbdAmount) FROM withdrawals WHERE githubUser = ?) as sbdWithdrawals, (SELECT SUM(usdAmount) FROM withdrawals WHERE githubUser = ?) as usdWithdrawals, SUM(pendingRewards) as pending FROM claims WHERE githubUser = ?";

export default (req, res) => {
  const githubUser = req.params.githubUser;
  database.query(
    QUERY_BALANCE_FOR_USER,
    [githubUser, githubUser, githubUser, githubUser, githubUser, githubUser],
    (error, result) => {
      if (error || result.length !== 1) {
        res.status(500);
        res.send("Error: Reading from database failed.");
      } else {
        res.json({
          sbdBalance: decimalFloor(
            Number(result[0].rewards) +
              Number(result[0].sbdBounties) -
              Number(result[0].sbdWithdrawals)
          ),
          usdBalance: decimalFloor(
            Number(result[0].usdBounties) - Number(result[0].usdWithdrawals)
          ),
          pending: decimalFloor(Number(result[0].pending))
        });
      }
    }
  );
};
