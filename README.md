# local-tunnel

ngrok-like tool written in Deno, deployed to Deno Deploy

## Usage

Clone this repo and deploy it to Deno Deploy.

[![Deno Deploy](https://deno.com/deploy.svg)](https://console.deno.com/new?clone=https://github.com/kt3k/local-tunnel)

Run the command:

```
deno -N https://your-app-name.deno.net/client.ts 8000
```

Then any HTTP request to https://your-app-name.deno.net is forwarded to localhost:8000 on your machine.

## License

MIT
