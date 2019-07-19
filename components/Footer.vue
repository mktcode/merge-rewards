<template>
  <footer
    class="p-5 bg-dark text-center d-flex align-items-center justify-content-center"
  >
    <span class="small text-muted mr-auto">
      Made with <font-awesome-icon icon="heart" />
      by
      <a href="https://steemit.com/@mkt" target="_blank" class="text-muted">
        @mkt
      </a>
    </span>
    <a
      href="https://steemit.com/@merge-rewards"
      target="_blank"
      class="text-light social-icon"
    >
      <img src="/steem-icon.png" alt="Steemit.com" />
    </a>
    <a
      href="https://github.com/mktcode/merge-rewards"
      target="_blank"
      class="text-light social-icon ml-2"
    >
      <font-awesome-icon :icon="['fab', 'github']" />
    </a>
  </footer>
</template>
