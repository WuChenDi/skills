// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  ui: {
    theme: {
      defaultVariants: {
        color: 'neutral',
      },
    },
  },

  routeRules: {
    '/': { isr: 60 },
  },

  devServer: {
    host: '0.0.0.0',
  },

  compatibilityDate: '2026-05-04',
})
