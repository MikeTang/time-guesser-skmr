# wb-template

Minimal Next.js 16 + Tailwind v4 scaffold used as the starting point for every
Work Buddies project.

## Why this is minimal

When a user asks Work Buddies to build an app, the platform provisions a new
repo from this template via the GitHub API ("Create repository from template"),
then the Developer agent (Dex) edits the code to match what the user wants.

Keeping the template bare means:

- Fewer moving parts to break on the first deploy
- Dex can add only what's needed (state, libraries, UI components) per project
- No env vars, no DB, no auth required to hit "Deploy" on Vercel

For apps that need to persist data, Dex should add browser `localStorage`
rather than a backend, unless the platform explicitly provisions one.

## Local dev

```sh
pnpm install
pnpm dev
```

## Deployment

Designed to deploy on Vercel with zero config. On `git push`, Vercel detects
Next.js and builds. No environment variables required.
