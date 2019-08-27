<template>
  <header class="p-5 text-light">
    <div class="row mt-5 pt-5">
      <div class="col-sm-6">
        <h1 class="mt-3 d-flex align-items-center font-weight-bold text-nowrap">
          Merge Rewards
        </h1>
        <h2 class="pl-5 mb-5 text-nowrap">Funding Social Development</h2>
      </div>
      <div class="col-sm-5">
        <div class="video">
          <iframe
            src="https://www.youtube.com/embed/X1bkESeSntI?modestbranding=1&color=white"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="sass" scoped>
header
  min-height: 400px
  h1
    font-size: 4rem
    img
      width: 60px
      height: 60px
  &:before
    content: " "
    position: absolute
    z-index: -1
    top: -1720px
    left: -270px
    width: 2000px
    height: 2000px
    transform: rotate(-14deg)
    border-radius: 300px
    background-color: #eee
  &:after
    content: " "
    position: absolute
    z-index: -1
    top: -1730px
    left: -250px
    width: 2000px
    height: 2000px
    transform: rotate(-15deg)
    border-radius: 300px
    background-color: #F4D03F
    background-image: linear-gradient(132deg, #16A085 50%, #F4D03F 100%)
  .video
    position: relative
    padding-bottom: 56.25%
    padding-top: 30px
    height: 0
    overflow: hidden
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3)
    iframe
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
</style>
