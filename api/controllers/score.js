import database from "../database";
import { getPullRequest, calculateScore } from "../helpers";

const QUERY_CLAIM = "SELECT score, booster FROM claims WHERE pullRequestId = ?";

export default (req, res) => {
  const pullRequest = req.body.pr;

  // return score from database or calculate it if not exists
  database.query(QUERY_CLAIM, [pullRequest.id], (error, result) => {
    if (error || result.length !== 1) {
      const githubAccessToken = req.body.githubAccessToken;
      const booster = req.body.booster;
      getPullRequest(pullRequest, githubAccessToken).then(response => {
        const repo = response.data.data.repository;
        const user = response.data.data.viewer;
        const score = calculateScore(repo, user, booster);
        res.json({ score, booster });
      });
    } else {
      res.json({ score: result[0].score, booster: result[0].booster });
    }
  });
};
