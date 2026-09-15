import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createArenaService, defaultFixturePath, loadArenaData, type ModelAnswerPatch, type NewModelAnswer } from "./arena-service.js";

const service = createArenaService(loadArenaData(), { persistPath: defaultFixturePath });
const port = Number(process.env.PORT ?? 3001);

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/arena") {
      sendJson(response, 200, service.getSnapshot());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/answers") {
      sendJson(response, 201, { answer: service.addAnswer(await readJson(request) as NewModelAnswer) });
      return;
    }

    const answerMatch = url.pathname.match(/^\/api\/answers\/([^/]+)$/);
    if (answerMatch && request.method === "PATCH") {
      sendJson(response, 200, { answer: service.updateAnswer(decodeURIComponent(answerMatch[1]), await readJson(request) as ModelAnswerPatch) });
      return;
    }
    if (answerMatch && request.method === "DELETE") {
      sendJson(response, 200, { answer: service.deactivateAnswer(decodeURIComponent(answerMatch[1])) });
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 400, { error: error instanceof Error ? error.message : "Invalid request" });
  }
});

server.listen(port, () => {
  console.log(`Arena API listening on http://localhost:${port}`);
});
