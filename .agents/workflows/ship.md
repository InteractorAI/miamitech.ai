---
description: how to ship / deploy this project
---

# Deployment

This project uses **Vercel with GitHub auto-deploy**. The `main` branch is connected to Vercel and deploys automatically on every push. Do NOT run `vercel --prod` manually.

## Steps

// turbo
1. Stage all changes:
```
git add -A
```

// turbo
2. Commit with a descriptive message:
```
git commit -m "feat: <short description of change>"
```

// turbo
3. Push to main (triggers auto-deploy):
```
git push origin main
```

That's it — Vercel will pick up the push and deploy automatically.
