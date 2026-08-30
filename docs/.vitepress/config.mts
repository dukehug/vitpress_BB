import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'BB Better Layout',
  description: 'A cleaner, faster way to use Blackboard Ultra.',
  sitemap: {
    hostname: 'https://bb.dukehsu.com'
  },
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Changelog', link: '/changelog' }
    ],

    sidebar: [
      {
        text: 'About',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'Project',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Privacy', link: '/PRIVACY' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dukehug' }
    ]
  }
})
