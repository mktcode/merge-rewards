const steem = require("steem");
const axios = require("axios");
require("dotenv").config({
  path: __dirname + "/../.env"
});

const to = process.argv[2];
let amount = process.argv[3];

if (to && amount) {
  // check if receiver exists
  axios
    .get("https://api.github.com/users/" + to)
    .then(() => {
      if (!isNaN(amount)) {
        amount = Number(amount);
        steem.broadcast.customJson(
          process.env.ACCOUNT_KEY,
          [],
          [process.env.ACCOUNT_NAME],
          "transfer",
          JSON.stringify({
            src: null,
            dest: "user:" + to,
            currency: "EUR",
            amount: amount.toFixed(3),
            metaData: {
              channel: "fidor"
            }
          }),
          (error, result) => {
            if (error) {
              console.log(error);
            } else {
              console.log(result);
            }
          }
        );
      } else {
        console.log("Amount is not a number.");
      }
    })
    .catch(e => {
      console.log("GitHub user does not exist.");
    });
} else {
  console.log(
    "Usage: node commands/depositEUR <GitHub Username> <Amount (Format: 0.000)>"
  );
}
