import express from "express";
import bodyParser from "body-parser";
import routes from "./configurations/routes.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const PORT = 42069;

const app = express();
const { ConfigRoutes } = routes;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

new ConfigRoutes();

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static("client/build"));
app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
