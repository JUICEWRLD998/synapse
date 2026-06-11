This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Kendo UI / Telerik Licensing

This project uses KendoReact components, which require a valid license key to suppress trial warnings and watermarks.

### How it is configured:
1. **Local License File**: The active license key is stored in [kendo-ui-license.txt](file:///c:/Users/fadhm/Desktop/gitnation/kendo-ui-license.txt) in the project root.
2. **Environment Variable**: The license key is also stored in `.env` as `TELERIK_LICENSE`.
3. **Automated Activation**: The `build` script in `package.json` has been updated to automatically run `npx kendo-ui-license activate` before executing the Next.js compilation:
   ```json
   "build": "npx kendo-ui-license activate && next build"
   ```

### Deploying to Vercel:
When deploying the application to Vercel (or any other hosting platform / CI-CD pipeline):
1. Add a new **Environment Variable** in your Vercel project settings:
   - **Key**: `TELERIK_LICENSE`
   - **Value**: The full license JWT key (copied from `.env` or [kendo-ui-license.txt](file:///c:/Users/fadhm/Desktop/gitnation/kendo-ui-license.txt)).
2. The custom build script will automatically activate the license at build time on Vercel, ensuring that no warning watermarks or console errors are present in production.
