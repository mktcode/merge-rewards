import { getPullRequest, calculateScore } from "../helpers";

export default (req, res) => {
  const pullRequest = req.body.pr;
  const githubAccessToken = req.body.githubAccessToken;
  getPullRequest(pullRequest, githubAccessToken).then(response => {
    const repo = response.data.data.repository;
    const user = response.data.data.viewer;
    const score = calculateScore(repo, user);
    res.json({ score });
  });
};
