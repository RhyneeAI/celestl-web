// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    // Private keys on server (Nitro)
    databaseUrl: process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/celestl',
    arcaeaServerUrl: process.env.ARCAEA_SERVER_URL || 'http://139.190.96.194:8765',
    arcaeaApiToken: process.env.ARCAEA_API_TOKEN || '',
    adminTotpSecret: process.env.ADMIN_TOTP_SECRET || '',
    visionServiceUrl: process.env.VISION_SERVICE_URL || 'http://127.0.0.1:8001',
    // Public keys (exposed to browser client)
    public: {
      appName: 'Celestl',
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  },
  app: {
    head: {
      title: 'Celestl — Arcaea Score & Rating Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Arcaea score tracking, play rating calculator, and server manager.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,300..900;1,300..900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap' }
      ]
    }
  }
})
