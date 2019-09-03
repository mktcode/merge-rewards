const steem = require("steem");
const axios = require("axios");
const mysql = require("mysql");
require("dotenv").config({
  path: __dirname + "/../.env"
});

console.log("Updating database from blockchain...");

const database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const getHistory = (name, from, limit, tries) => {
  return new Promise((resolve, reject) => {
    if (tries) {
      steem.api.getAccountHistory(name, from, limit, (error, result) => {
        if (error) {
          console.log(error);
          console.log("FAILED: " + tries + " tries left. Trying...");
          tries--;
          setTimeout(() => {
            getHistory(name, from, limit, tries)
              .then(innerResult => resolve(innerResult))
              .catch(e => reject(e));
          }, 5000);
        } else {
          if (result[result.length - 1][0] === from) {
            const next = from + limit;
            setTimeout(() => {
              getHistory(name, next, limit, tries)
                .then(innerResult => resolve([...result, ...innerResult]))
                .catch(e => reject(e));
            }, 100);
          } else {
            resolve(result);
          }
        }
      });
    } else {
      reject("Failed too often.");
    }
  });
};

const queryDb = (query, params) => {
  params = params || null;
  return new Promise((resolve, reject) => {
    database.query(query, params, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// insert transfers recursively in a transaction
const insertTransfers = queries => {
  if (queries.length) {
    database.query(query, error => {
      if (error) {
        return database.rollback(() => {
          console.log(error);
        });
      } else {
        insertTransfer(queries.shift());
      }
    });
  } else {
    database.commit(error => {
      if (error) {
        return database.rollback(function() {
          console.log(error);
        });
      }
    });
  }
};

const QUERY_TRANSFER_TX_IDS = "SELECT steemTxId FROM transfers";
const INSERT_TRANSFER =
  "INSERT INTO transfers (steemTxId, blockNum, src, dest, currency, amount, metaData, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

const QUERY_ADDRESSES_TX_IDS = "SELECT steemTxId FROM addresses";
const INSERT_ADDRESSES =
  "INSERT INTO addresses (steemTxId, blockNum, account, addresses) VALUES (?, ?, ?, ?)";

// get full history
getHistory(process.env.ACCOUNT_NAME, 10000, 10000, 5)
  .then(fullHistoryWithDuplicates => {
    // remove duplicates, none-custom_json ops and everything before STEEM_START_BLOCK
    const allItems = [];
    fullHistoryWithDuplicates.forEach(h => {
      if (
        h[1].op[0] === "custom_json" &&
        !allItems.find(hh => hh[0] === h[0]) &&
        h[1].block > process.env.STEEM_START_BLOCK
      ) {
        allItems.push(h);
      }
    });

    // get all existing transfer's and addresses' steem tx ids
    Promise.all([
      queryDb(QUERY_TRANSFER_TX_IDS),
      queryDb(QUERY_ADDRESSES_TX_IDS)
    ])
      .then(results => {
        const existingTransfers = results[0];
        const existingAddresses = results[1];

        if (allItems.length) {
          // separate between transfers and addresses, remove existing entries
          const newTransfers = [];
          const newAddresses = [];
          allItems.forEach(cj => {
            if (
              cj[1].op[1].id === "transfer" &&
              !existingTransfers.includes(cj[1].trx_id)
            ) {
              newTransfers.push(cj[1]);
            }
          });
          allItems.forEach(cj => {
            if (
              cj[1].op[1].id === "addresses" &&
              !existingAddresses.includes(cj[1].trx_id)
            ) {
              newAddresses.push(cj[1]);
            }
          });

          // inserting to database
          newTransfersQueries = [];
          newTransfers.forEach(t => {
            try {
              const json = JSON.parse(t.op[1].json);
              if (
                json.hasOwnProperty("src") &&
                json.hasOwnProperty("dest") &&
                json.hasOwnProperty("currency") &&
                json.hasOwnProperty("amount") &&
                json.hasOwnProperty("metaData")
              ) {
                newTransfersQueries.push(
                  database.format(INSERT_TRANSFER, [
                    t.trx_id,
                    t.block,
                    json.src,
                    json.dest,
                    json.currecny,
                    json.amount,
                    json.metaData,
                    t.timestamp
                  ])
                );
              }
            } catch (e) {
              console.log(e);
            }
          });
          database.beginTransaction(error => {
            if (error) {
              throw err;
            }
            insertTransfers(newTransfersQueries);
          });

          // inserting to database
          newAddresses.forEach(a => {
            try {
              const json = JSON.parse(t.op[1].json);
              if (
                json.hasOwnProperty("account") &&
                json.hasOwnProperty("addresses")
              ) {
                databse.query(
                  INSERT_ADDRESSES,
                  [t.trx_id, t.block, json.account, json.addresses],
                  (error, result) => {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log(
                        "Addresses added to database. (" + t.trx_id + ")"
                      );
                    }
                  }
                );
              }
            } catch (e) {
              console.log(e);
            }
          });
        }
      })
      .catch(e => console.log(e));
  })
  .catch(e => console.log(e));
