---
description: how to ship / deploy this project
---

> [!IMPORTANT]
> NEVER execute this workflow or its steps unless the USER explicitly asks you to "ship" or "deploy" the project.

# Deployment

This project uses Vercel with GitHub auto-deploy. The `main` branch is connected to Vercel and deploys automatically on every push.

Do not run `vercel --prod` manually.

## Steps

1. Check the working tree.

   ```sh
   git status --short --branch
   ```

2. Review changes before staging.

   ```sh
   git diff
   ```

3. Stage only the intended files.

   ```sh
   git add <paths>
   ```

4. Commit with a descriptive message.

   ```sh
   git commit -m "feat: <short description>"
   ```

5. Push to `main`.

   ```sh
   git push origin main
   ```

Vercel will pick up the push and deploy automatically.
