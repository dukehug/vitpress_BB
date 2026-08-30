import { readdirSync, type Dirent } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type DefaultTheme } from 'vitepress'

const docsRoot = fileURLToPath(new URL('..', import.meta.url))
const ignoredDirectories = new Set(['.vitepress', 'public'])
const siteUrl = 'https://bb.dukehsu.com'
const sidebarOrder: Record<string, string[]> = {
  '/': ['Introduction', 'Feature', 'About'],
  '/Introduction': ['what-is-bb-better-layout.md', 'getting-started.md'],
  '/Feature': [
    'Appearance.md',
    'Custom-External-Links.md',
    'Keyboard-Shortcuts.md',
    'Study-Note.md',
    'Weekly-Schedule.md',
    'FAQs.md'
  ],
  '/About': [
    'About-author.md',
    'Changelog.md',
    'changelog-vit.md',
    'Privacy.md',
    'MIT-License.md'
  ]
}

function formatLabel(name: string) {
  const normalizedName = name.replace(/\.md$/, '').toLowerCase()

  if (normalizedName === 'faqs') return 'FAQs'
  if (normalizedName === 'mit-license') return 'MIT License'
  if (normalizedName === 'changelog-vit') return 'Website Changelog'

  const words = name
    .replace(/\.md$/, '')
    .split(/[-_\s]+/)

  if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) {
    return words[0]
  }

  return words
    .map((word) => {
      const lowerCaseWord = word.toLowerCase()

      if (lowerCaseWord === 'bb') return 'BB'
      if (lowerCaseWord === 'api') return 'API'

      return lowerCaseWord.charAt(0).toUpperCase() + lowerCaseWord.slice(1)
    })
    .join(' ')
}

function sortDirectoryEntries(
  first: Dirent,
  second: Dirent,
  preferredOrder: string[] = []
) {
  const firstPosition = preferredOrder.indexOf(first.name)
  const secondPosition = preferredOrder.indexOf(second.name)

  if (firstPosition !== secondPosition) {
    if (firstPosition === -1) return 1
    if (secondPosition === -1) return -1

    return firstPosition - secondPosition
  }

  if (first.isDirectory() !== second.isDirectory()) {
    return first.isDirectory() ? -1 : 1
  }

  return first.name.localeCompare(second.name, 'en', {
    numeric: true,
    sensitivity: 'base'
  })
}

function createSidebarItems(
  absoluteDirectory: string,
  routeSegments: string[]
): DefaultTheme.SidebarItem[] {
  const directoryRoute = `/${routeSegments.join('/')}`

  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => {
      if (entry.name.startsWith('.')) return false
      if (entry.isDirectory()) return !ignoredDirectories.has(entry.name)

      return entry.isFile() && entry.name.endsWith('.md')
    })
    .sort((first, second) => sortDirectoryEntries(
      first,
      second,
      sidebarOrder[directoryRoute]
    ))
    .flatMap((entry): DefaultTheme.SidebarItem[] => {
      if (entry.isDirectory()) {
        const childItems = createSidebarItems(
          join(absoluteDirectory, entry.name),
          [...routeSegments, entry.name]
        )

        if (childItems.length === 0) return []

        return [{
          text: formatLabel(entry.name),
          collapsed: false,
          items: childItems
        }]
      }

      const fileName = entry.name.replace(/\.md$/, '')
      const route = fileName.toLowerCase() === 'index'
        ? `/${routeSegments.join('/')}/`
        : `/${[...routeSegments, fileName].join('/')}`

      return [{
        text: fileName.toLowerCase() === 'index'
          ? 'Overview'
          : formatLabel(fileName),
        link: route
      }]
    })
}

function createDocsSidebar() {
  const sectionEntries = readdirSync(docsRoot, { withFileTypes: true })
    .filter((entry) => (
      entry.isDirectory()
      && !entry.name.startsWith('.')
      && !ignoredDirectories.has(entry.name)
    ))
    .sort((first, second) => sortDirectoryEntries(
      first,
      second,
      sidebarOrder['/']
    ))
    .flatMap((entry): Array<{
      name: string
      item: DefaultTheme.SidebarItem
    }> => {
      const items = createSidebarItems(join(docsRoot, entry.name), [entry.name])

      if (items.length === 0) return []

      return [{
        name: entry.name,
        item: {
          text: formatLabel(entry.name),
          collapsed: false,
          items
        }
      }]
    })

  const sections = sectionEntries.map(({ item }) => item)

  return Object.fromEntries(
    sectionEntries.map(({ name }) => [`/${name}/`, sections])
  )
}

function createPageUrl(relativePath: string) {
  const route = /(^|\/)index\.md$/.test(relativePath)
    ? relativePath.replace(/(^|\/)index\.md$/, '$1')
    : relativePath.replace(/\.md$/, '.html')

  return new URL(route, `${siteUrl}/`).href
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'BB Better Layout',
  description: 'A cleaner, faster way to use Blackboard Ultra.',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/icon.png' }],
    ['meta', { name: 'theme-color', content: '#167568' }],
    // GA4
    ['script', {
      async: '',
      src: 'https://www.googletagmanager.com/gtag/js?id=G-CGSSCBT4DB'
    }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        window.dataLayer.push(arguments);
      }

      gtag('js', new Date());
      gtag('config', 'G-CGSSCBT4DB');
    `]
  ],
  sitemap: {
    hostname: siteUrl,
    transformItems: (items) => items.filter(({ url }) => (
      !url.endsWith('PRIVACY.html') && !url.endsWith('changelog.html')
    ))
  },
  lastUpdated: true,
  transformHead({ pageData }) {
    const pageUrl = pageData.frontmatter.canonical
      ?? createPageUrl(pageData.relativePath)
    const pageTitle = pageData.relativePath === 'index.md'
      ? 'BB Better Layout — A Better Blackboard Ultra Experience'
      : pageData.frontmatter.title
        ? `${pageData.frontmatter.title} | BB Better Layout`
        : 'BB Better Layout'
    const pageDescription = pageData.frontmatter.description
      ?? 'A cleaner, faster way to use Blackboard Ultra.'
    const ogImage = pageData.frontmatter.ogImage
      ? new URL(pageData.frontmatter.ogImage, siteUrl).href
      : undefined

    return [
      ['link', { rel: 'canonical', href: pageUrl }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'en_US' }],
      ['meta', { property: 'og:site_name', content: 'BB Better Layout' }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ...(ogImage ? [
        ['meta', { property: 'og:image', content: ogImage }],
        ['meta', { property: 'og:image:width', content: '1200' }],
        ['meta', { property: 'og:image:height', content: '630' }],
        ['meta', { property: 'og:image:alt', content: pageTitle }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:image', content: ogImage }],
        ['meta', { name: 'twitter:image:alt', content: pageTitle }]
      ] as [string, Record<string, string>][] : []),
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }]
    ]
  },
  themeConfig: {
    logo: '/icon.png',

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/Introduction/what-is-bb-better-layout' }
    ],

    sidebar: createDocsSidebar(),

    footer: {
      message: 'Built for students using Blackboard Ultra. <a href="/About/Privacy.html">Privacy</a> · <a href="/About/MIT-License.html">MIT License</a>',
      copyright: 'Copyright © 2026 Duke Hsu'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dukehug' },
      { icon: 'x', link: 'https://x.com/DukeHsuPh' },
      { icon: 'facebook', link: 'https://www.facebook.com/DukeHsuPh'}
    ]
  }
})
