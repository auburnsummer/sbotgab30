import express, { Express, Request, Response } from "express";
import { imageRoute } from "./imageRoute.js";

import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { songDataRoute } from "./songDataRoute.js";

const app: Express = express();
const port = 3000;

// app.use(express.static('../assets'))

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../assets')));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.get("/img", imageRoute);

app.get("/songData", songDataRoute);

app.listen(port, "0.0.0.0", 511, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});