import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url ?? "", true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Request error", err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

const io = new Server(httpServer, {
  path: "/socket.io",
  addTrailingSlash: false,
  cors: {
    origin: dev ? true : false,
  },
});

globalThis.__communityIO = io;

io.on("connection", (socket) => {
  socket.join("community");
});

httpServer.once("error", (err) => {
  console.error(err);
  process.exit(1);
});

httpServer.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port} (Socket.io + Next.js)`);
});
