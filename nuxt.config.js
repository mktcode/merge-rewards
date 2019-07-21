require("dotenv").config();

export default {
  mode: "spa",

  serverMiddleware: ["~/api/index"],

  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, user-scalable=no"
      },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      },
      {
        "http-equiv": "X-UA-Compatible",
        content: "IE=edge"
      }
    ],
    link: [
      { rel: "icon", type: "image/png", href: "/logo-with-bg.png" },
      {
        rel: "stylesheet",
        type: "text/css",
        href:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
      },
      {
        rel: "stylesheet",
        type: "text/css",
        href: "https://fonts.googleapis.com/css?family=Montserrat&display=swap"
      }
    ],
    script: [
      { src: "https://code.jquery.com/jquery-3.3.1.slim.min.js" },
      {
        src:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
      },
      {
        src:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
      },
      {
        src:
          "https://www.paypal.com/sdk/js?client-id=" +
          process.env.PAYPAL_CLIENT_ID
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["assets/main.sass"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/font-awesome",
    "~/plugins/vue-steemconnect",
    "~/plugins/load"
  ],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/axios", "@nuxtjs/dotenv"],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
};
