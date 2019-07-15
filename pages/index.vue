<template>
  <div>
    <Navbar />
    <Header />
    <div class="container py-5">
      <div class="row my-5">
        <div class="col-md-6 mb-3">
          <h1 class="mb-4">Contribute!</h1>
          <p>
            Contribute to other people's Open Source projects on GitHub. Your
            contributions can be anything, from developing new features to
            fixing typos in a project's documentation.<br />
            <br />
            As long as there's a pull request that the project owner decided to
            merge into his/her project, you'll be able to claim your rewards by
            just clicking a button.
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
          >
            About Pull Requests
          </a>
        </div>
        <div class="col-md-6">
          <img src="/pull-requests.png" alt="pull-requests.png" class="w-100" />
        </div>
      </div>
      <div class="row my-5">
        <div class="col-md-6 order-md-2 mb-3">
          <h1 class="mb-4">Raise your score!</h1>
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
          >
            About Scores
          </a>
        </div>
        <div class="col-md-6 order-md-1">
          <img src="/scores.png" alt="scores.png" class="w-100" />
        </div>
      </div>
      <div class="row my-5">
        <div class="col-md-6">
          <h1 class="mb-4">Claim your rewards!</h1>
          <p>
            You can withdraw your rewards in Bitcoin, Ethereum and other
            Cryptocurrencies at any time. We also offer an exchange service to
            <b>Euro or Dollar</b> for withdrawals greater than 100 $/€ (for
            free).
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
          >
            About Rewards
          </a>
        </div>
        <div class="col-md-6 text-center">
          <img src="/crypto-logos.png" alt="crypto-logos.png" class="mw-100" />
        </div>
      </div>
    </div>
    <div class="container-fluid steem text-light py-5">
      <div class="container d-flex flex-column flex-md-row align-items-center">
        <div class="d-flex flex-column mr-0 mr-md-5">
          <img src="/steem.png" alt="steem.png" class="float-left mb-4" />
          <div class="text-nowrap mb-4">
            <a href="#" target="_blank" class="btn btn-light">
              Connect
            </a>
            <a
              href="https://signup.steemit.com"
              target="_blank"
              class="btn btn-outline-light"
            >
              Sign Up
            </a>
            <a
              href="https://steem.com"
              target="_blank"
              class="btn btn-outline-light"
            >
              About STEEM
            </a>
          </div>
        </div>
        <div>
          <p>
            Your rewards will be generated in STEEM and then converted to your
            favorite currency. STEEM is a decentralized content network as well
            as a digital currency to reward creators of good content. The
            intrinsic value of STEEM lies in its possibility to be used as
            influence on how rewards are distributed.<br />
            <br />
            Merge Rewards considers your merged pull requests as "good content"
            and uses its influence to distribute STEEM tokens to you, which you
            can then use to buy goods and services from other STEEM users,
            exchange it for "real money", like USD or Euro or to gain more
            influence in the voting process yourself.
          </p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
export default {
  components: {
    Navbar: () => import("@/components/Navbar"),
    Header: () => import("@/components/Header"),
    Footer: () => import("@/components/Footer")
  }
};
</script>
