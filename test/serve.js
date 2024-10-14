#!/usr/bin/env node
import { createReadStream, existsSync } from "node:fs";
import http from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Simple node server, restricted to serving only the assets we expect.
 *
 * Listens on port 8081 by default; provide port on commandline to override:
 *
 * > node test/serve.js 3000
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = +process.argv[2] || 8081;
const pathToContentType = {
  "index.html": "text/html; charset=utf-8",
  "dist/applause-button.js": "text/javascript",
  "dist/applause-button.css": "text/css",
};

(() => {
  const server = http.createServer((req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405);
      res.end();
      return;
    }
    // Find file from URL path
    const path = req.url?.substring(1) || "index.html"; //chop off leading slash
    if (!Object.hasOwn(pathToContentType, path)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = join(__dirname, "..", path);
    if (!existsSync(file)) {
      res.writeHead(404);
      res.write("Did you forget to build?");
      res.end();
      return;
    }

    res.setHeader("Content-Type", pathToContentType[path]);
    res.writeHead(200);
    createReadStream(file).pipe(res);
  });

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
})();
