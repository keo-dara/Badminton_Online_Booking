export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: false,
  app: {
    head: {
      script: [
        { src: 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js', type: 'text/javascript' },
      ]
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@vant/nuxt',
    'nuxt-lucide-icons',
    'dayjs-nuxt',
    '@pinia/nuxt'
  ],
  lucide: {
    namePrefix: 'Icon'
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,

    }
  }
});
