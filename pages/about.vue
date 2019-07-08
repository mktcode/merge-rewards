<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#">Merge Rewards</a>
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
          <li class="nav-item active">
            <a class="nav-link" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
        </ul>
      </div>
    </nav>
    <header class="p-5 bg-secondary text-light">
      <h1>Merge Rewards</h1>
      <h2>Rewarding Social Development</h2>
      <p class="lead">Earn money with your pull requests on GitHub!</p>
      <a href="#" class="btn btn-success btn-lg">Get Started!</a>
    </header>
    <div class="container py-5">
      <div class="row">
        <div class="col-6">
          <h3>Contribute!</h3>
          <p>
            Contribute to other people's Open Source projects on GitHub by
            submitting changes via pull requests. You contributions can be
            anything, from developing new features to fixing typos in a
            project's documentation.<br />
            <br />
            As long as there's a pull request that the project owner decided to
            merge into his/her project, you'll be able to claim your rewards by
            just clicking a button.
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
            class="btn btn-outline-dark"
          >
            <font-awesome-icon :icon="['fab', 'github']" />
            About Pull Requests
          </a>
        </div>
        <div class="col-6">
          <h3>And claim your rewards!</h3>
          <p>
            Once your pull requests get merged you can visit this website and
            claim your rewards. An algorithm calculates a score for your
            contribution, which determines the size of your reward.<br />
            <br />
            The popularity of the project and your own reputation on GitHub are
            the most important factors. Your actual contribution is secondary.
            That might change in the future but for now Merge Rewards assumes
            that a small fix in a README file can be as valuable as some big new
            feature, depending on the number of people who benefit from it.
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
            class="btn btn-outline-dark"
          >
            <font-awesome-icon icon="tasks" />
            About Scores
          </a>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-12">
          <h2>Your Rewards</h2>
          <p>
            Your rewards will be paid in STEEM. STEEM is a decentralized content
            network as well as a digital currency to reward creators of good
            content. The intrinsic value of STEEM lies in its possibility to be
            used as influence on how rewards are distributed.<br />
            <br />
            Merge Rewards considers your merged pull requests as good "content"
            and uses its influence to distribute STEEM tokens to you, which you
            can then use to gain more influence yourself, to buy goods and
            services from other STEEM users or exchange for "real money", like
            USD or Euro, by selling it to others who want to invest in the STEEM
            currency or in their influence in the network.
          </p>
        </div>
      </div>
    </div>
    <footer class="p-5 bg-dark"></footer>
  </div>
</template>

<style lang="sass">
.bg-dark
  background-color: #333 !important
.bg-secondary
  background-color: #444 !important
</style>
