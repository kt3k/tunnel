function main() {
  const port = +Deno.args[0];

  const url = new URL(import.meta.url);

  if (!port) {
    console.error(`Usage: deno --allow-net=${url.host} client.ts <port>`);
    Deno.exit(1);
  }

  const sock = new WebSocket(`ws://${url.host}`);

  sock.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data) as {
      id: string;
      pathname: string;
      method: string;
      body: string;
      status: number;
      headers: [string, string][];
    };
    console.log("Received:", data);

    try {
      const resp = await fetch(`http://localhost:${port}${data.pathname}`, {
        method: data.method,
        body: data.body,
      });
      const respBody = await resp.text();
      sock.send(JSON.stringify({
        id: data.id,
        body: respBody,
        status: resp.status,
        headers: [...resp.headers],
      }));
    } catch (e) {
      sock.send(JSON.stringify({
        id: data.id,
        body: ``,
        status: 503,
        headers: [["Content-Type", "text/plain"]],
      }));
    }
  });
}
main();
