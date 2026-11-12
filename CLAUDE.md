# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Additional notes (not covered in AGENTS.md)

- **No test suite.** Verification is `npm run lint`, `npm run build`, and walking the page in `npm run dev`. There is no single-test command.
- **Deployment** (Docker image → Docker Hub → Azure Container Apps) is documented in `Deployment.md`. `next.config.ts` sets `output: "standalone"`, which the `Dockerfile` depends on; don't remove it. `GET /api/health` exists for probes and must not call OpenRouter.
- **Runtime secret:** `OPENROUTER_API_KEY` is read at request time in `src/app/api/chat/route.ts` (not at build), so it is supplied to the container as an Azure secret, never baked into the image.
- `README.md` still carries the Rohit-specific title and description; it is in the personalization checklist in AGENTS.md.
- **Chat rate limit:** `src/lib/rate-limit.ts` is an in-memory per-IP sliding window (default 10 per 30 min; `CHAT_RATE_LIMIT` / `CHAT_RATE_WINDOW_MINUTES` override). It resets on restart and is per-process, which is fine while the Azure app runs a single replica. Locally every request shares the `unknown` IP bucket.
- **Versioning:** the version is the major number in `package.json` (= Docker tag = git tag `v<N>`). Releases go through `scripts/release.ps1` and are logged in `RELEASES.md`.
