const steem = require("steem");
require("dotenv").config({ path: __dirname + "/../.env" });

function getHistory(name, from, limit, tries) {
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
}

getHistory(process.env.ACCOUNT_NAME, 10000, 10000, 5)
  .then(fullHistoryWithDuplicates => {
    const history = [];
    fullHistoryWithDuplicates.forEach(h => {
      if (!history.find(hh => hh[0] === h[0])) {
        history.push(h);
      }
    });
    const customJson = history.filter(h => h[1].op[0] === "custom_json");
    customJson.forEach(cj => {
      const txId = cj[1].trx_id;
      let json = JSON.parse(cj[1].op[1].json);
      switch (cj[1].op[1].id) {
        case "test":
          console.log("test:", json);
        case "deposit":
          console.log("deposit:", json);
      }
    });
  })
  .catch(e => console.log(e));
