import axios from "axios";
import uuid from "uuid";
import steem from "steem";
import database from "../database";

const INSERT_BOUNTY =
  "INSERT INTO bounties (steemTxId, githubUser, btcAddress, ltcAddress, ethAddress, xmrAddress, steemAddress, sbdAddress, issueTitle, issueId, issueOwner, issueRepo, issueNum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
const QUERY_BOUNTY =
  "SELECT id FROM bounties WHERE githubUser = ? AND issueOwner = ? AND issueRepo = ? AND issueNum = ?";

const initTrade = (currency, sessionToken) => {
  return axios
    .post("https://blocktrades.us/api/v2/simple-api/initiate-trade", {
      inputCoinType: currency,
      outputCoinType: "sbd",
      outputAddress: process.env.ACCOUNT_NAME,
      affiliateId: "b8ac630a-5e6e-4b00-a8a8-46c33cb7488a",
      sessionToken: sessionToken
    })
    .then(response => {
      return {
        currency: currency,
        address:
          currency === "steem"
            ? response.data.inputMemo
            : response.data.inputAddress
      };
    });
};

export default (req, res) => {
  const githubUser = res.locals.authenticatedGithubUser.login;
  const githubAccessToken = req.body.githubAccessToken;
  const issue = req.body.issue;

  // check if issue exists
  axios
    .post(
      "https://api.github.com/graphql",
      {
        query: `{
          repository(owner: "${issue.owner}", name: "${issue.repo}") {
            name
            issue(number: ${issue.number}) {
              id
              closed
              title
            }
          }
        }`
      },
      {
        headers: {
          Authorization: "bearer " + githubAccessToken
        }
      }
    )
    .then(response => {
      if (response.data.data.repository.issue.closed) {
        res.status(400);
        res.send("Bad Request: Issue is closed.");
      } else {
        const issueTitle = response.data.data.repository.issue.title;
        const issueId = response.data.data.repository.issue.id;
        database.query(
          QUERY_BOUNTY,
          [githubUser, issue.owner, issue.repo, issue.number],
          (error, result) => {
            if (error) {
              res.status(500);
              res.send("Error: Reading from database failed.");
            } else {
              if (result.length) {
                res.status(400);
                res.send(
                  "Bad Request: Bounty wallets already exist for this issue and githubUser."
                );
              } else {
                axios
                  .post("https://blocktrades.us/api/v2/sessions", {
                    email: process.env.BLOCKTRADES_EMAIL,
                    password: process.env.BLOCKTRADES_PASS
                  })
                  .then(response => {
                    const session = response.data;
                    Promise.all([
                      initTrade("btc", session.token),
                      initTrade("ltc", session.token),
                      initTrade("eth", session.token),
                      initTrade("xmr", session.token),
                      initTrade("steem", session.token),
                      { currency: "sbd", address: uuid.v4() }
                    ])
                      .then(values => {
                        steem.broadcast.customJson(
                          process.env.ACCOUNT_KEY,
                          [],
                          [process.env.ACCOUNT_NAME],
                          "bounty:create",
                          JSON.stringify({
                            githubUser: githubUser,
                            issueId: issueId,
                            addresses: {
                              btc: values[0].address,
                              ltc: values[1].address,
                              eth: values[2].address,
                              xmr: values[3].address,
                              steem: values[4].address,
                              sbd: values[5].address
                            }
                          }),
                          (error, result) => {
                            if (error) {
                              res.status(500);
                              res.send(
                                "Error: Writing to steem blockchain failed."
                              );
                            } else {
                              database.query(
                                INSERT_BOUNTY,
                                [
                                  result.id,
                                  githubUser,
                                  values[0].address,
                                  values[1].address,
                                  values[2].address,
                                  values[3].address,
                                  values[4].address,
                                  values[5].address,
                                  issueTitle,
                                  issueId,
                                  issue.owner,
                                  issue.repo,
                                  issue.number
                                ],
                                (error, result) => {
                                  if (error) {
                                    res.status(500);
                                    res.send(
                                      "Error: Writing to database failed."
                                    );
                                  } else {
                                    res.status(201);
                                    res.send();
                                  }
                                }
                              );
                            }
                          }
                        );
                      })
                      .catch(() => {
                        res.status(500);
                        res.send("Error: Could not create addresses.");
                      });
                  })
                  .catch(e => {
                    console.log(e.response.data);
                    res.status(500);
                    res.send("Error: Could not create blocktrades session.");
                  });
              }
            }
          }
        );
      }
    })
    .catch(() => {
      res.status(500);
      res.send("Bad Request: Issue not found.");
    });
};
