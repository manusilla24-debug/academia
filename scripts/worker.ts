import { runOneJob } from "../src/lib/pipeline";
const once = process.argv.includes("--once");
const max = Number(
  process.argv.find((v) => v.startsWith("--max-steps="))?.split("=")[1] ??
    Infinity,
);
if (!(max > 0)) throw new Error("--max-steps debe ser positivo.");
let n = 0;
while (await runOneJob(undefined, max)) {
  n++;
  if (once || max !== Infinity) break;
  if (n > 1000) break;
}
console.log(
  `Worker terminado: ${n} trabajo(s) atendido(s). Consulta sus checkpoints y errores en la biblioteca.`,
);
