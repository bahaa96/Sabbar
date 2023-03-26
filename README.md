### Sabbar Weather App

> first step, you need to rename `.example.env` file to `.env` to activate the watched environment variables file watched by the app server.

to run the app in development mode you can use

```
npm run dev
```

to have a production build of the app you can use

```
npm run build
```

#### Solution Breakdown:

- Each Report takes the most distant past of the given date ranges as it's start date and most distant future date as it's end date.
- Each Report takes the minimum and maximum boundaries of all cities latitude and longitude as it's coordinates.
- Each new city row gets added with a default date range which is a week from today.

#### Technical Breakdown:

- I used a Cities list API provided by the same Forecast API service.
- I used a combination of clean architecture and domain-driven hexagonal architecture.
- For the CSS solution I've built a node.js script to transform "native CSS" which I chose as default styling solution to share the app theme with "Ant Design" the UI library used CSS-in-JS solution
