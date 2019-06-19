const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/github/access-token", (req, res) => {
  let code = req.body.code;
  axios
    .post("https://github.com/login/oauth/access_token", {
      client_id: "cc26e30001cc702f5663",
      client_secret: "2780f183b62c742b08c66e4f2182ba01ae0553f0",
      code,
      accept: "application/json"
    })
    .then(response => {
      const urlParams = new URLSearchParams(response.data);
      const accessToken = urlParams.get("access_token");
      res.json({ accessToken });
    });
});

module.exports = {
  path: "/api",
  handler: app
};
