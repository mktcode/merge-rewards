const axios = require("axios");

axios
  .post("https://blocktrades.us/api/v2/sessions")
  .then(response => {
    const session = response.data;

    let data = {
      inputCoinType: "steem",
      outputCoinType: "btc",
      outputAddress: "12oWwJ64RF4oSDV2bsD4fLFmQUHTiuxedx",
      affiliateId: "b8ac630a-5e6e-4b00-a8a8-46c33cb7488a",
      refundAddress: "merge-rewards",
      sessionToken: session.token
    };

    axios
      .post("https://blocktrades.us/api/v2/simple-api/initiate-trade", data)
      .then(response => {
        console.log(response.data);
      })
      .catch(e => console.log(e.response.data.error));
  })
  .catch(e => console.log(e.response.data.error));
