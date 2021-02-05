import express from "express";
import bodyParser from "body-parser";
import routes from "./configurations/routes.js";
import { NODE_ENV, PORT as ENV_PORT } from "./keys.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const PORT = ENV_PORT || 42069;

const app = express();
const { ConfigRoutes } = routes;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

new ConfigRoutes();

if (NODE_ENV === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
