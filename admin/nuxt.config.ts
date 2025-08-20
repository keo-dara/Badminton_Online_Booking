export default defineNuxtConfig({
  compatibilityDate: '2025-08-20',
  runtimeConfig: {
    apiUrl: process.env.API_URL,
  },
  ssr: false,
  devtools: { enabled: true },
  srcDir: "src",
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
    "nuxt-icon",
    "@pinia/nuxt",
    "dayjs-nuxt",
    "nuxt-time",
  ],
  pinia: {
    storesDirs: ["./src/stores/**"],
  },
  i18n: {
    vueI18n: "./src/config/i18n.config.ts",
  },
  build: {
    transpile:
      process.env.NODE_ENV === "production"
        ? [
            "naive-ui",
            "vueuc",
            "@css-render/vue3-ssr",
            "@juggle/resize-observer",
          ]
        : ["@juggle/resize-observer"],
  },
  vite: {
    optimizeDeps: {
      include:
        process.env.NODE_ENV === "development"
          ? ["naive-ui", "vueuc", "date-fns-tz/formatInTimeZone"]
          : [],
    },
  },
  compatibilityDate: "2024-07-20",
});
