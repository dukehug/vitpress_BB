import { mkdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const cards = [
  ['home', 'BLACKBOARD, MADE BETTER', 'BB Better Layout', 'A cleaner, faster way to use Blackboard Ultra.'],
  ['getting-started', 'GETTING STARTED', 'Install and Pin|the Extension', 'Add BB Better Layout to Chrome or Firefox.'],
  ['what-is-bb-better-layout', 'INTRODUCTION', 'What Is BB|Better Layout?', 'See how it improves everyday work in Blackboard.'],
  ['appearance', 'FEATURE', 'Appearance', 'Choose a comfortable theme and course cover.'],
  ['custom-external-links', 'FEATURE', 'Custom External Links', "Keep your favorite destinations in Blackboard's side panel."],
  ['faqs', 'FEATURE', 'Frequently Asked|Questions', 'Quick answers about storage, cloud saving, homework, and AI.'],
  ['keyboard-shortcuts', 'FEATURE', 'Keyboard Shortcuts', 'Navigate, switch courses, and search with fewer clicks.'],
  ['study-note', 'FEATURE', 'Study Note', 'Keep device-local Markdown notes inside Blackboard.'],
  ['weekly-schedule', 'FEATURE', 'Weekly Schedule', 'Turn current courses into a simple weekly timetable.'],
  ['about-author', 'ABOUT', 'About the Author', 'Meet Duke Hsu, the creator of BB Better Layout.'],
  ['changelog', 'ABOUT', 'Extension Changelog', 'User-facing BB Better Layout features and fixes.'],
  ['website-changelog', 'ABOUT', 'Website Changelog', 'Documentation, navigation, design, and SEO updates.'],
  ['privacy', 'ABOUT', 'Privacy Policy', 'Understand what the extension processes and stores.'],
  ['mit-license', 'ABOUT', 'MIT License', 'The open-source license for BB Better Layout.']
]

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const outputDirectory = join(projectRoot, 'docs/public/og')
mkdirSync(outputDirectory, { recursive: true })

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function titleMarkup(title) {
  const lines = title.split('|')
  const fontSize = lines.some((line) => line.length > 22) ? 54 : 62
  return lines.map((line, index) => (
    `<text x="72" y="${268 + index * 70}" class="title" font-size="${fontSize}">${escapeXml(line)}</text>`
  )).join('\n    ')
}

function svgFor([, section, title, summary]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="background" x1="0" x2="1">
      <stop offset="0" stop-color="#f6fbf9"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0e3d36" flood-opacity="0.13"/>
    </filter>
    <style>
      text { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .title { fill: #0e3d36; font-weight: 750; letter-spacing: -1.5px; }
    </style>
  </defs>
  <rect width="1200" height="1200" fill="#ffffff"/>
  <g transform="translate(0 285)">
  <rect width="1200" height="630" fill="url(#background)"/>
  <circle cx="1110" cy="32" r="250" fill="#dceee9" opacity="0.42"/>
  <circle cx="80" cy="650" r="220" fill="#d7ece6" opacity="0.22"/>

  <g filter="url(#shadow)">
    <rect x="830" y="92" width="300" height="446" rx="30" fill="#ffffff"/>
    <path d="M860 92h32v446h-32a30 30 0 0 1-30-30V122a30 30 0 0 1 30-30Z" fill="#0e3d36"/>
    <rect x="916" y="142" width="176" height="34" rx="12" fill="#167568" opacity="0.14"/>
    <rect x="916" y="204" width="176" height="34" rx="12" fill="#167568" opacity="0.22"/>
    <rect x="916" y="276" width="80" height="96" rx="16" fill="#d2e8e2"/>
    <rect x="1012" y="276" width="80" height="96" rx="16" fill="#e3eeeb"/>
    <rect x="916" y="410" width="176" height="76" rx="16" fill="#167568" opacity="0.1"/>
    <circle cx="861" cy="134" r="10" fill="#8bcabc"/>
    <circle cx="861" cy="170" r="10" fill="#ffffff" opacity="0.7"/>
    <circle cx="861" cy="206" r="10" fill="#ffffff" opacity="0.45"/>
  </g>

  <rect x="70" y="62" width="52" height="52" rx="13" fill="#167568"/>
  <text x="96" y="98" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="750">BB</text>
  <text x="140" y="97" fill="#0e3d36" font-size="22" font-weight="650" letter-spacing="0.6">BB BETTER LAYOUT</text>

  <text x="72" y="206" fill="#167568" font-size="20" font-weight="750" letter-spacing="1.8">${escapeXml(section)}</text>
  ${titleMarkup(title)}
  <text x="72" y="460" fill="#4c6861" font-size="27" font-weight="400">${escapeXml(summary)}</text>

  <rect x="72" y="516" width="82" height="8" rx="4" fill="#167568"/>
  <rect x="164" y="516" width="28" height="8" rx="4" fill="#167568" opacity="0.28"/>
  </g>
</svg>`
}

for (const card of cards) {
  const [fileName] = card
  const source = join(outputDirectory, `${fileName}.svg`)
  const destination = join(outputDirectory, `${fileName}.png`)
  writeFileSync(source, svgFor(card))

  const result = spawnSync('/usr/bin/qlmanage', ['-t', '-s', '1200', '-o', outputDirectory, source], {
    encoding: 'utf8'
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Could not generate ${destination}`)
  }

  renameSync(`${source}.png`, destination)
  unlinkSync(source)

  const cropResult = spawnSync('/usr/bin/sips', ['-c', '630', '1200', destination], {
    encoding: 'utf8'
  })

  if (cropResult.status !== 0) {
    throw new Error(cropResult.stderr || cropResult.stdout || `Could not crop ${destination}`)
  }
}

console.log(`Generated ${cards.length} social preview images in ${outputDirectory}`)
