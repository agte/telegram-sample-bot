import Application from './src/Application.js';

const app = new Application({
  port: process.env.PORT,
});

app.start()
  .then(() => {
    console.log(`Running on port ${app.port}`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(-1);
  });
