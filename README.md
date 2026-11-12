# Rohit Nair — Software Engineer

Personal portfolio site for Rohit Nair, a software engineer focused on scalable backend services, cloud infrastructure (AWS, Terraform, Kubernetes), and payment systems. It covers my background, career timeline, and contact details, and includes a Digital Twin chat that answers questions about my experience.

**Live site: [portfolio.rnair.dev](https://portfolio.rnair.dev/)**

- LinkedIn: [linkedin.com/in/rnair8](https://www.linkedin.com/in/rnair8)
- GitHub: [github.com/rnair86](https://github.com/rnair86)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The chat needs `OPENROUTER_API_KEY` in a local `.env` file.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Syne + IBM Plex Sans
- Docker image on Azure Container Apps

Profile content lives in `src/data/profile.ts`. Deployment steps are in `Deployment.md`, and released versions are logged in `RELEASES.md`.
