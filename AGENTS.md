<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment notes

- **Frontend hosts on Netlify** (<https://abd-ciphervault.netlify.app>), not
  Vercel — `netlify.toml` (`command = "npm run build"`, `publish = ".next"`,
  `@netlify/plugin-nextjs`) is the source of truth. A stale `vercel.json` is
  still present from an earlier Vercel attempt; ignore/remove it rather than
  editing it.
- **`build` script must keep the `--webpack` flag**
  (`"build": "next build --webpack"`). Next.js 16 defaults to Turbopack, but
  the PWA plugin (`@ducanh2912/next-pwa`) only integrates with webpack (it
  injects a webpack-only config), which crashes a Turbopack build with
  `Call retries were exceeded` / "webpack config and no turbopack config".
  `dev` already had `--webpack` for the same reason; `build` didn't, and that
  mismatch is what broke it. Always test `npm run build` locally before
  assuming a deploy config problem.
- **Backend URL**: `NEXT_PUBLIC_API_URL` must be
  `https://abd-cipher-vault-be.vercel.app/api` (include the `/api` suffix —
  the Express app mounts routes under `/api/auth`, `/api/vault`, etc.), not
  `localhost`, in any deployed environment.
- Netlify env vars are all `NEXT_PUBLIC_*` and get baked into the client
  bundle at build time — set them in Netlify's dashboard *before* the first
  deploy, not after.
