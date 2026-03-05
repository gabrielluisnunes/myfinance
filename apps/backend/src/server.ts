import { buildApp } from "./app";

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "0.0.0.0";

const app = buildApp();

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
