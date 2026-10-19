// Servidor local mínimo para probar la app en el navegador. Uso: npm run serve [puerto]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2]) || 8790;
const types = { ".html": "text/html; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".js": "text/javascript" };

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([\\/])+/, "");
  const file = join(root, path || "index.html");
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "cache-control": "no-store" }).end(body);
  } catch {
    res.writeHead(404).end("no encontrado");
  }
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}`));
