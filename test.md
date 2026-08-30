# Website Test Guide

This guide covers the BB Better Layout landing page and help website. It does not test the Chrome extension itself; extension behavior should be tested in the extension repository.

## Requirements

- Node.js 20 or later
- npm
- A current desktop browser
- A narrow mobile viewport or a mobile device

## Install and build

For a clean checkout, install the locked dependencies:

```sh
npm ci
```

Build the production site:

```sh
npm run docs:build
```

The check passes when the command exits without errors and creates `docs/.vitepress/dist/`.

To review the production output locally:

```sh
npm run docs:preview
```

Use `npm run docs:dev` while editing. A successful development server is useful for review, but it does not replace the production build check.

## Core route checks

Open each route directly and through the site navigation:

- `/`
- `/changelog`
- `/PRIVACY`
- `/markdown-examples`
- `/api-examples`

Confirm that each page loads without a 404, the page title is correct, and every navigation or call-to-action link reaches its intended destination.

## Content checks

- Confirm that public copy is in plain English and uses short sentences.
- Confirm that every public page has its own `title` and `description` frontmatter.
- Check feature names and privacy statements against the current extension behavior.
- Check Chrome Web Store, support, and GitHub links before publishing.
- Do not add an extension version to the changelog until it matches a published release.

## Layout and accessibility checks

- Review the home page and document pages at desktop and mobile widths.
- Confirm that navigation remains usable without horizontal scrolling.
- Check light and dark modes for readable text and visible focus states.
- Navigate links and controls with the keyboard only.
- Confirm that headings follow a logical order and images have useful alternative text.
- Check that screenshots do not hide or expose personal Blackboard information.

## SEO and sharing checks

- Confirm that the generated HTML uses `lang="en-US"`.
- Confirm that the sitemap uses `https://bb.dukehsu.com` and includes last-modified dates.
- Confirm that each public page has a relevant 1200 × 630 social image before launch.
- Confirm that `docs/public/CNAME` still contains `bb.dukehsu.com`.

## Release gate

A website change is ready to merge when:

- `npm run docs:build` passes.
- All changed routes pass desktop and mobile review.
- New or changed links have been opened and checked.
- User-facing changes are recorded in `docs/changelog.md`.
- Privacy-sensitive changes have been reviewed against `docs/PRIVACY.md`.

## Test record

Copy this block into a pull request or release note:

```text
Date:
Commit:
Node version:
Browser and viewport:
npm run docs:build: PASS / FAIL
Routes checked:
Accessibility checks:
Notes:
```
