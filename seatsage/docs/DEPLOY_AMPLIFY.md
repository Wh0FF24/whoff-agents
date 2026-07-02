# Deploy SeatSage to seatsage.whoffagents.com (AWS Amplify)

You already host whoffagents.com on Amplify, so this is about 10 minutes of console
clicks. The repo already contains the two config files Amplify needs at the root:
`amplify.yml` (serves the `seatsage/` directory as a static site, no build step) and
`customHttp.yml` (cache + security headers).

## 1. Create the Amplify app (one time)

1. AWS Console -> Amplify -> **Create new app** -> **Host web app**.
2. Source: **GitHub** -> authorize -> repo `Wh0FF24/whoff-agents` -> branch `main`
   (or the PR branch `claude/app-store-niche-launch-070azi` if you want it live
   before the PR merges; you can switch the branch later).
3. Build settings: Amplify auto-detects `amplify.yml` at the repo root. Confirm the
   artifact `baseDirectory` shows `seatsage`. No build commands are expected.
4. Save and deploy. You get a default URL like `main.dXXXXXXXX.amplifyapp.com`;
   check it loads before moving on.

## 2. Attach the subdomain

1. In the Amplify app: **Hosting -> Custom domains -> Add domain**.
2. Enter `whoffagents.com`. Because the domain is already managed by your Amplify
   account / Route 53, Amplify lists it. Choose **Add domain**.
3. Remove the default root mapping if offered, and add a single subdomain mapping:
   `seatsage` -> branch `main`.
4. Amplify provisions the ACM certificate and the Route 53 record automatically.
   Propagation is usually a few minutes; the console shows Available when done.

## 3. Verify

- https://seatsage.whoffagents.com loads the landing page.
- https://seatsage.whoffagents.com/app.html loads the planner.
- https://seatsage.whoffagents.com/sitemap.xml and /robots.txt return 200.

## 4. Tell Google

1. Search Console (https://search.google.com/search-console): add property
   `seatsage.whoffagents.com` (DNS verification is automatic if the domain is
   already verified for whoffagents.com; otherwise add the TXT record in Route 53).
2. Submit the sitemap: `https://seatsage.whoffagents.com/sitemap.xml`.
3. Request indexing for `/` from the URL inspection bar.

## Notes

- Every push to the connected branch auto-deploys. The canonical URLs, OG tags,
  sitemap and robots.txt in the repo already point at `seatsage.whoffagents.com`.
- The Higgsfield deployment (https://sunny-shore-765.higgsfield.app) can stay up as
  a mirror; its pages carry the same canonical tag pointing at your domain, so
  Google consolidates ranking signals to seatsage.whoffagents.com.
- SSL, CDN and cache invalidation are all handled by Amplify on each deploy.
