<template>
  <div>You will be redirected...</div>
</template>

<script>
export default {
  mounted() {
    let accessToken = this.$route.query["access_token"];
    if (accessToken) {
      localStorage.setItem("steemconnect_access_token", accessToken);
      this.$store
        .dispatch("steemconnect/login")
        .then(() => this.$router.push("/"));
    }
  }
};
</script>
