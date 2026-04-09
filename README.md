This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## APIs Used

- https://github.com/asbeane/mlb-stats-api
- https://github.com/joerex1418/mlb-statsapi-swagger-docs/blob/main/swagger-docs.json

## Getting Started

(You may need to run `npm install` first)

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

## Yearly Edits to Page

As this year's TA of CS47N, all YOU need to do to make the app current for your students is:
1. Edit the `mlb-constants.ts` file. You need to change the SEASON_START_DATE, SEASON_END_DATE, ASSIGNMENT_END_DATE, SEASON_LENGTH_DAYS, and CURRENT_SEASON variables so that the page and api calls reflect the current MLB season.
2. Change the canvas, syllabus, and email links in the `nav-user.tsx` page to reflect the current class.
3. Upload a new `predictions.csv` that includes the baseball challenge predictions of your new batch of students.

That's it! The page should be good to go for your students!


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
