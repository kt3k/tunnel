function main() {
  const port = +Deno.args[0];

  const url = new URL(import.meta.url);

  if (!port) {
    console.error(
      `Usage: deno --allow-net=${url.host} ${url.origin}/client.ts <port>`,
    );
    Deno.exit(1);
    return;
  }

  const sock = new WebSocket(`wss://${url.host}`);

  sock.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });
  sock.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });
  sock.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
  });
  sock.addEventListener("message", async (event) => {
    console.log("message received", event.data);
    const data = JSON.parse(event.data) as {
      id: string;
      pathname: string;
      method: string;
      body: string;
      status: number;
      headers: [string, string][];
    };

    try {
      const resp = await fetch(`http://localhost:${port}${data.pathname}`, {
        method: data.method,
        body: data.body,
      });
      const respBody = await resp.text();
      console.log(data.method, data.pathname, "->", resp.status);
      sock.send(JSON.stringify({
        id: data.id,
        body: respBody,
        status: resp.status,
        headers: [...resp.headers],
      }));
    } catch (e) {
      console.log(data.method, data.pathname, "->", 503);
      // deno-lint-ignore no-explicit-any
      const message = `Error: ${(e as any).message}`;
      console.log(message);
      sock.send(JSON.stringify({
        id: data.id,
        body: message,
        status: 503,
        headers: [["Content-Type", "text/plain"]],
      }));
    }
  });
}
main();
