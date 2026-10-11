# Nudge: deploy guide

This folder is the whole site: `index.html` (the app) and `netlify/functions/chat.mjs` (a tiny server that lets the chat talk to Claude without exposing your API key). Feedback is collected by Netlify Forms, with no extra code.

## 1. Get an API key (for the chat)
1. Go to **platform.claude.com** (the Claude Console) and sign in or create an account. Older links to console.anthropic.com may not work.
2. Add a few dollars of credit under Settings, then Billing (platform.claude.com/settings/billing). The API needs prepaid credit before it will create a key.
3. Go to Settings, then API keys, then **Create key**. Name it "nudge", and copy it right away. It starts with `sk-ant-` and is only shown once.
4. In the Console's billing or limits settings, set a **monthly spend limit** (for example $10) so a surprise can't cost you much.
5. Anthropic's accounts are for adults. If you're under 18, ask a parent or guardian to create the account and key.

## 2. Put the files on GitHub
1. Create a free GitHub account and a new repository (for example `nudge`).
2. Click "Add file", then "Upload files", and drag in everything from this folder: `index.html`, `netlify.toml`, and the `netlify` folder. Commit.

## 3. Deploy on Netlify
1. Sign up at netlify.com (you can use your GitHub login).
2. "Add new project", then "Import an existing project", then GitHub, then pick your repo. Keep the default settings and deploy.
3. Open "Project configuration", then "Environment variables", and add:
   - `ANTHROPIC_API_KEY` = your key
   - (optional) `ALLOWED_ORIGIN` = your site address, like `https://your-site.netlify.app`
   - (optional) `NUDGE_MODEL` = a different Claude model name. The default is Haiku 4.5, which is cheap and fast.
4. Redeploy ("Deploys", then "Trigger deploy") so the variables take effect.

## 4. Turn on feedback emails
In Netlify, open "Forms" and check the `feedback` form appears after you submit a test. Then "Project configuration", then "Notifications", then "Form submission notifications" to get an email for each one.

## 5. Test it
- Open your site, open the chat, and type "add a 60 minute essay due Friday". It should appear on your calendar.
- Click Feedback in the sidebar, send a test, and check it shows up in Netlify Forms.

## Good to know
- Every chat message costs a small amount of API credit. The function limits message size and rate per visitor, but your spend limit is the real safety net.
- Calendar data lives in each person's own browser. Clearing browser data erases it.
- If chat says "missing API key", the variable isn't set or you haven't redeployed since adding it.
