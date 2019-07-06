<template>
  <div>You will be redirected...</div>
</template>

<script>
export default {
  mounted() {
    let code = this.$route.query["code"];
    if (code) {
      this.$axios
        .$post(process.env.API_URL + "/github/access-token", {
          client_id: "cc26e30001cc702f5663",
          client_secret: "2780f183b62c742b08c66e4f2182ba01ae0553f0",
          code,
          accept: "application/json"
        })
        .then(response => {
          if (response.accessToken) {
            localStorage.setItem("github_access_token", response.accessToken);
            this.$store
              .dispatch("github/login")
              .then(() => this.$router.push("/"));
          }
        });
    }
  }
};
</script>
