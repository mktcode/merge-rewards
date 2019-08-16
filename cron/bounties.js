const axios = require("axios");
const steem = require("steem");
const mysql = require("mysql");
require("dotenv").config({ path: __dirname + "/../.env" });

const database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const QUERY_OLDEST_OPEN_BOUNTY_DATE =
  "SELECT MIN(createdAt) as oldestDate FROM bounties WHERE releasedAt IS NULL ORDER BY createdAt DESC";

const QUERY_OPEN_BOUNTIES =
  "SELECT * FROM bounties WHERE releasedAt IS NULL AND createdAt >= ?";

const QUERY_BOUNTY_DEPOSIT_EXISTS =
  "SELECT id FROM bountyDeposits WHERE txId = ?";

const INSERT_BOUNTY_DEPOSIT =
  "INSERT INTO bountyDeposits (receivingAddress, sbdAmount, currency, bountyId, txId) VALUES (?, ?, ?, ?, ?)";

const getBlocktradesTransactions = dateLimit => {
  return new Promise((resolve, reject) => {
    axios
      .post("https://blocktrades.us/api/v2/sessions", {
        email: process.env.BLOCKTRADES_EMAIL,
        password: process.env.BLOCKTRADES_PASS
      })
      .then(response => {
        const session = response.data;
        axios
          .get("https://blocktrades.us/api/v2/transactions", {
            params: {
              sessionToken: session.token,
              lastModifiedSince: dateLimit
            }
          })
          .then(response => {
            resolve(response.data);
          })
          .catch(e => reject(e));
      })
      .catch(e => reject(e));
  });
};

const getSbdTransactions = dateLimit => {
  return new Promise((resolve, reject) => {
    steem.api.getAccountHistory(
      process.env.ACCOUNT_NAME,
      -1,
      10000,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          transactions = [];
          result.forEach(r => {
            if (
              r[1].op[0] === "transfer" &&
              r[1].op[1].to === process.env.ACCOUNT_NAME
            ) {
              transactions.push(r);
            }
          });
          resolve(transactions);
        }
      }
    );
  });
};

const writeCustomJson = (
  receivingAddress,
  sbdAmount,
  currency,
  bountySteemTxId,
  txId
) => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      process.env.ACCOUNT_KEY,
      [],
      [process.env.ACCOUNT_NAME],
      "bounty:deposit",
      JSON.stringify({
        receivingAddress,
        sbdAmount,
        currency,
        bountySteemTxId,
        txId
      }),
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

database.query(QUERY_OLDEST_OPEN_BOUNTY_DATE, (error, result) => {
  if (error) {
    console.log(error);
    database.end();
  } else {
    const oldestDate = result[0].oldestDate;
    database.query(QUERY_OPEN_BOUNTIES, [oldestDate], (error, openBounties) => {
      if (error) {
        console.log(error);
        database.end();
      } else {
        if (openBounties.length) {
          Promise.all([
            getBlocktradesTransactions(oldestDate),
            getSbdTransactions(oldestDate)
          ]).then(results => {
            const blocktradesTransactions = results[0];
            const sbdTransactions = results[1];
            const queries = [];
            blocktradesTransactions.forEach(bt => {
              const receivingBounty = openBounties.find(ob => {
                return (
                  (bt.inputCoinType === "btc" &&
                    bt.inputAddress === ob.btcAddress) ||
                  (bt.inputCoinType === "ltc" &&
                    bt.inputAddress === ob.ltcAddress) ||
                  (bt.inputCoinType === "eth" &&
                    bt.inputAddress === ob.ethAddress) ||
                  (bt.inputCoinType === "xmr" &&
                    bt.inputAddress === ob.xmrAddress) ||
                  (bt.inputCoinType === "steem" &&
                    bt.inputAddress === ob.steemAddress)
                );
              });

              if (receivingBounty) {
                queries.push(
                  new Promise((resolve, reject) => {
                    database.query(
                      QUERY_BOUNTY_DEPOSIT_EXISTS,
                      [bt.transactionId],
                      (error, result) => {
                        if (error) {
                          reject(error);
                        } else if (!result.length) {
                          writeCustomJson(
                            bt.inputAddress,
                            bt.outputAmount,
                            bt.inputCoinType,
                            receivingBounty.steemTxId,
                            bt.transactionId
                          )
                            .then(() => {
                              database.query(
                                INSERT_BOUNTY_DEPOSIT,
                                [
                                  bt.inputAddress,
                                  bt.outputAmount,
                                  bt.inputCoinType,
                                  receivingBounty.id,
                                  bt.transactionId
                                ],
                                error => {
                                  if (error) {
                                    reject(error);
                                  } else {
                                    resolve();
                                  }
                                }
                              );
                            })
                            .catch(e => console.log(e));
                        } else {
                          resolve();
                        }
                      }
                    );
                  })
                );
              }
            });
            sbdTransactions.forEach(t => {
              const receivingBounty = openBounties.find(ob => {
                return ob.sbdAddress === t[1].op[1].memo;
              });

              if (receivingBounty) {
                queries.push(
                  new Promise((resolve, reject) => {
                    database.query(
                      QUERY_BOUNTY_DEPOSIT_EXISTS,
                      [t[1].trx_id],
                      (error, result) => {
                        if (error) {
                          reject(error);
                        } else if (!result.length) {
                          writeCustomJson(
                            t[1].op[1].memo,
                            parseFloat(t[1].op[1].amount.replace(" SBD", "")),
                            "sbd",
                            receivingBounty.steemTxId,
                            t[1].trx_id
                          )
                            .then(() => {
                              database.query(
                                INSERT_BOUNTY_DEPOSIT,
                                [
                                  t[1].op[1].memo,
                                  parseFloat(
                                    t[1].op[1].amount.replace(" SBD", "")
                                  ),
                                  "sbd",
                                  receivingBounty.id,
                                  t[1].trx_id
                                ],
                                error => {
                                  if (error) {
                                    reject(error);
                                  } else {
                                    resolve();
                                  }
                                }
                              );
                            })
                            .catch(e => console.log(e));
                        } else {
                          resolve();
                        }
                      }
                    );
                  })
                );
              }
            });
            Promise.all(queries)
              .catch(errors => {
                console.log(errors);
              })
              .finally(() => {
                database.end();
              });
          });
        } else {
          database.end();
        }
      }
    });
  }
});
