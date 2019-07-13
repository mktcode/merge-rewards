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
      <a href="#" class="btn btn-success btn-lg">
        <font-awesome-icon :icon="['fab', 'github']" />
        Connect
      </a>
    </header>
    <div class="container py-5">
      <div class="row">
        <div class="col-6">
          <h3>Contribute!</h3>
          <p>
            Contribute to other people's Open Source projects on GitHub by
            submitting changes via pull requests. Your contributions can be
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
          <h3>Raise your score!</h3>
          <p>
            Your pull requests are scored by a
            <b>transparent algorithm</b> which is constantly improved by the
            community, to prevent abuse and to distribute rewards in a most fair
            way.<br />
            <br />
            On top of that, every member of the community can affect your reward
            by simply voting for it. The weight of these votes is based on how
            much a person already contributed to other projects.
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
          <h2>And claim your rewards!</h2>
          <p>
            You can withdraw your rewards in Bitcoin, Ethereum and other
            Cryptocurrencies at any time. We also offer an exchange service to
            <b>Euro or Dollar</b> for withdrawals greater than 100 $/€ (for
            free).
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
    </div>
    <div class="container-fluid bg-primary text-light py-5">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h2>The STEEM blockchain</h2>
            <p>
              Your rewards will be generated in STEEM. STEEM is a decentralized
              content network as well as a digital currency to reward creators
              of good content. The intrinsic value of STEEM lies in its
              possibility to be used as influence on how rewards are
              distributed.<br />
              <br />
              Merge Rewards considers your merged pull requests as good
              "content" and uses its influence to distribute STEEM tokens to
              you, which you can then use to buy goods and services from other
              STEEM users, exchange it for "real money", like USD or Euro or to
              gain more influence in the voting process yourself.
            </p>
            <a href="#" target="_blank" class="btn btn-outline-light">
              Connect
            </a>
            <a
              href="https://signup.steemit.com"
              target="_blank"
              class="btn btn-outline-light"
            >
              Sign Up
            </a>
            <a href="#" target="_blank" class="btn btn-outline-light">
              About STEEM
            </a>
          </div>
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
