import express from "express";

import scoreController from "./controllers/score";
import githubAccessTokenController from "./controllers/github-access-token";
import databaseController from "./controllers/database";
import balanceController from "./controllers/balance";
import claimController from "./controllers/claim";
import withdrawController from "./controllers/withdraw";
import createAccountController from "./controllers/create-account";
import addBoostersController from "./controllers/add-boosters";
import boostersController from "./controllers/boosters";
import transferBoostersController from "./controllers/transfer-boosters";

import auth from "./auth";

const app = express();

app.use(express.json());

app.post("/github-access-token", githubAccessTokenController);
app.get("/database/:table", databaseController);
app.get("/balance/:githubUser", balanceController);
app.post("/score", scoreController);
app.post("/claim", auth, claimController);
app.post("/withdraw", auth, withdrawController);
app.post("/create-account", auth, createAccountController);
app.post("/add-boosters", auth, addBoostersController);
app.get("/boosters/:githubUser", boostersController);
app.post("/transfer-boosters", auth, transferBoostersController);

module.exports = {
  path: "/api",
  handler: app
};
