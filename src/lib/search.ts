import type { State, Segment } from "./domain";
const stop = new Set(
  "a al ante bajo con contra de del desde durante e el ella en entre es esta este esto hacer hasta la las lo los para por que qué se si sin sobre su sus un una unos y cómo cuando cuándo cuál cuáles donde dónde explica canal".split(
    " ",
  ),
);
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export function queryTokens(q: string) {
  return normalize(q)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 1 && !stop.has(t))
    .slice(0, 20);
}
export function searchLocal(s: State, q: string): Segment[] {
  const terms = queryTokens(q);
  if (!terms.length) return [];
  return s.segments
    .map((g) => {
      const body = normalize(g.text);
      const score = terms.reduce((n, t) => n + (body.includes(t) ? 1 : 0), 0);
      return { g, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map((r) => r.g);
}
