<template>
  <div>You will be redirected...</div>
</template>

<script>
export default {
  mounted() {
    let code = this.$route.query["code"];
    if (code) {
      this.$axios
        .$post(process.env.API_URL + "/github/access-token", { code })
        .then(response => {
          if (response.accessToken) {
            localStorage.setItem("github_access_token", response.accessToken);
            this.$store.dispatch("load").finally(() => {
              this.$router.push("/");
            });
          }
        });
    }
  }
};
</script>
