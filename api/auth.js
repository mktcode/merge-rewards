import axios from "axios";

export default (req, res, next) => {
  const githubAccessToken = req.body.githubAccessToken;
  if (!githubAccessToken) {
    res.status(403);
    res.send("No access token provided.");
  } else {
    axios
      .get("https://api.github.com/user", {
        params: { access_token: githubAccessToken }
      })
      .then(response => {
        res.locals.authenticatedGithubUser = response.data;
        next();
      })
      .catch(() => {
        res.status(403);
        res.send("Invalid access token provided.");
      });
  }
};
