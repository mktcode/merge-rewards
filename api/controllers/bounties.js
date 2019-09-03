import database from "../database";
import { decimalFloor } from "../../lib/helpers";

const QUERY_BOUNTIES =
  "SELECT SUBSTR(account, 7) as issueId, currency, incoming - outgoing as balance FROM balances WHERE account LIKE 'issue:%'";

export default (req, res) => {
  database.query(QUERY_BOUNTIES, (error, result) => {
    if (error) {
      res.status(500);
      res.send("Error: Reading from database failed.");
    } else {
      const bounties = [];
      result.forEach(r => {
        const existing = bounties.find(b => r.issueId === b.issueId);
        if (existing) {
          if (r.currency === "USD") existing.balance.usd = r.balance;
          if (r.currency === "EUR") existing.balance.eur = r.balance;
          if (r.currency === "SBD") exisitng.balance.sbd = r.balance;
        } else {
          const bounty = {
            issueId: r.issueId,
            balance: {
              usd: 0,
              eur: 0,
              sbd: 0
            }
          };
          if (r.currency === "USD") bounty.balance.usd = r.balance;
          if (r.currency === "EUR") bounty.balance.eur = r.balance;
          if (r.currency === "SBD") bounty.balance.sbd = r.balance;
          bounties.push(bounty);
        }
      });
      res.json(bounties);
    }
  });
};
