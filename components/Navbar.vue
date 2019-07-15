<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <nuxt-link class="navbar-brand font-weight-bold" to="/">
      <img src="/logo.png" alt="logo.png" />
    </nuxt-link>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/claim">Claim</nuxt-link>
        </li>
        <!-- <li class="nav-item">
          <nuxt-link class="nav-link" to="/pull-requests"
            >Pull Requests</nuxt-link
          >
        </li>
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/projects">Projects</nuxt-link>
        </li> -->
      </ul>
    </div>
  </nav>
</template>
