let sock: WebSocket | null = null;
const reqMap: Map<string, (res: Response) => void> = new Map();
export default {
  async fetch(req: Request) {
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);
      socket.addEventListener("open", () => {
        sock = socket;
      });
      socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        const resolve = reqMap.get(data.id);
        if (resolve) {
          const response = new Response(data.body, {
            status: data.status,
            headers: Object.fromEntries(data.headers),
          });
          resolve(response);
          reqMap.delete(data.id);
        }
      });
      socket.addEventListener("close", () => {
        if (sock === socket) sock = null;
      });
      return response;
    }
    const url = new URL(req.url);
    if (url.pathname === "/client.ts") {
      if (sock) {
        return new Response("console.log('Client already connected');", { status: 400 });
      }
      return new Response(await Deno.readTextFile("./client.ts"));
    }
    if (sock) {
      console.log("Forwarding request via WebSocket:", req.url);
      const { promise, resolve } = Promise.withResolvers<Response>();
      const reqId = crypto.randomUUID();
      reqMap.set(reqId, resolve);
      sock.send(
        JSON.stringify({
          id: reqId,
          pathname: url.pathname,
          method: req.method,
          headers: [...req.headers],
          body: (await req.text()) || null,
        }),
      );
      return promise;
    } else {
      console.log("WebSocket not connected");
      return new Response("Not Found", { status: 404 });
    }
  },
};
