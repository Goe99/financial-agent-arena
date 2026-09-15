import { createServer } from "node:http";
import { createArenaService } from "./arena-service.js";

const service = createArenaService();
const port = Number(process.env.PORT ?? 3001);

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/api/health") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (request.method === "GET" && request.url === "/api/arena") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(service.getSnapshot()));
    return;
  }

  response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Arena API listening on http://localhost:${port}`);
});

