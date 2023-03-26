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

### Solution Breakdown:

#### Technical Breakdown:

- I used a combination of clean architecture and domain-driven hexagonal architecture.

- For the CSS solution I've built a node.js script to transform "native css" which I chose as default styling solution to share the app theme with "Ant Design" the UI library used CSS-in-JS solution
