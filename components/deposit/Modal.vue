<template>
  <div class="modal modal-fs fade" id="deposit-modal" tabindex="-1">
    <div class="modal-dialog text-dark text-left">
      <div class="modal-content">
        <ModalHeader title="Deposit" />
        <div class="modal-body">
          <Deposit title="Where do you want to deposit money?" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Deposit: () => import("@/components/deposit/Deposit")
  }
};
</script>
