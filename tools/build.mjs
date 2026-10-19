// Genera index.html: un solo archivo autónomo con fotos, React y la app incrustados.
// Uso: npm run build
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const img = {};
for (const f of readdirSync(join(root, "img")).filter((f) => f.endsWith(".webp")).sort()) {
  img[f.replace(/\.webp$/, "")] = "data:image/webp;base64," + readFileSync(join(root, "img", f)).toString("base64");
}

const app = transformSync(read("src/app.jsx"), {
  loader: "jsx",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  target: "es2019",
  charset: "ascii",
}).code;

const script = (code) => `<script>${code}</script>`;
const html = [
  read("src/head.html").trimEnd(),
  "<body>",
  '<div id="root"></div>',
  script("window.IMG=" + JSON.stringify(img) + ";"),
  script(read("src/manifest.js")),
  script(read("src/vendor/react.production.min.js")),
  script(read("src/vendor/react-dom.production.min.js")),
  script(app),
  "</body>",
  "</html>",
  "",
].join("\n");

writeFileSync(join(root, "index.html"), html);
console.log(`index.html · ${(html.length / 1024).toFixed(0)} KB · ${Object.keys(img).length} fotos`);
