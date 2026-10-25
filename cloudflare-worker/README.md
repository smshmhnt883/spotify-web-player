# VaultX Music - Cloudflare Worker Setup Guide (Method 2)

Setting up this free Cloudflare Worker connects your R2 bucket `my-music-vault` directly to VaultX Music.
**Result**: Whenever you upload any new MP3/M4A/WAV files to Cloudflare R2, they will instantly appear in your web app and Windows desktop player without running any commands!

---

## Step 1: Create the Worker in Cloudflare Dashboard

1. Log into your Cloudflare Dashboard: **[dash.cloudflare.com](https://dash.cloudflare.com)**
2. In the left-hand navigation sidebar, click **Workers & Pages** -> **Overview** (or **Create application**).
3. Click the blue **Create application** button, then select **Worker** and click **Deploy**.
   - Cloudflare will assign a name like `vaultx-music-api` (or you can rename it).

---

## Step 2: Bind the R2 Bucket to your Worker

1. In your new Worker's dashboard, click the **Settings** tab at the top.
2. In the sub-menu on the left, click **Variables and Secrets** (or **Bindings** / **R2 Bucket Bindings**).
3. Scroll down to **R2 Bucket Bindings** and click **Add binding**:
   - **Variable name**: `MY_BUCKET` *(Must be in ALL CAPS)*
   - **R2 bucket**: select `my-music-vault`
4. Click **Deploy** / **Save**.

---

## Step 3: Paste the Code

1. Back on the Worker page, click the **Edit code** button (top right).
2. Delete whatever is currently in `worker.js` and paste the contents of `worker.js` from this folder.
3. Click **Deploy** (top right).

---

## Step 4: Copy your Worker URL & Test

1. Your Worker will now have a public URL, for example:
   `https://vaultx-music-api.<your-cloudflare-subdomain>.workers.dev`
2. Open that URL in a new browser tab.
   - You should immediately see a JSON response listing all 7 songs in your bucket!
3. Paste that Worker URL into VaultX Music (click the **R2 Vault** button in the top bar)!
