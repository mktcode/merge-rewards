import database from "../database";
import { getPullRequest, calculateScore } from "../../lib/helpers";

const QUERY_CLAIM = "SELECT score, booster FROM claims WHERE pullRequestId = ?";

export default (req, res) => {
  const pullRequestId = req.body.pullRequestId;

  // return score from database or calculate it if not exists
  database.query(QUERY_CLAIM, [pullRequestId], (error, result) => {
    if (error || result.length !== 1) {
      const githubAccessToken = req.body.githubAccessToken;
      const booster = req.body.booster;
      getPullRequest(pullRequestId, githubAccessToken).then(response => {
        const repo = response.data.data.node.repository;
        const user = response.data.data.viewer;
        const score = calculateScore(repo, user, booster);
        res.json({ score, booster });
      });
    } else {
      res.json({ score: result[0].score, booster: result[0].booster });
    }
  });
};
