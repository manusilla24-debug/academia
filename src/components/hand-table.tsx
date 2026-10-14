import type { Hand } from "@/lib/domain";
import { positions } from "@/lib/domain";
function PlayingCard({ card }: { card: string }) {
  const suits: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
  return (
    <span
      className={`playing-card ${["h", "d"].includes(card[1]) ? "red" : ""}`}
      aria-label={card}
    >
      {card[0]}
      <small>{suits[card[1]]}</small>
    </span>
  );
}
export function HandTable({ hand }: { hand: Hand }) {
  return (
    <div className="hand-visual">
      <div className="poker-table">
        <div className="board">
          <span className="eyebrow">
            {hand.street} · {hand.stakes}
          </span>
          <div className="cards">
            {hand.board.length ? (
              hand.board.map((c) => <PlayingCard card={c} key={c} />)
            ) : (
              <span className="muted">Preflop</span>
            )}
          </div>
          <strong>
            {hand.pot} BB <small className="muted">en el bote</small>
          </strong>
        </div>
        {positions.map((p, i) => (
          <div
            className={`seat seat-${i} ${p === hand.heroPosition ? "hero-seat" : ""}`}
            key={p}
          >
            <span>
              {p === hand.heroPosition
                ? "Hero"
                : p === hand.villainPosition
                  ? "Villain"
                  : "—"}{" "}
              · {p}
            </span>
            {p === hand.heroPosition ? (
              <div className="cards">
                {hand.hero.map((c) => (
                  <PlayingCard card={c} key={c} />
                ))}
              </div>
            ) : (
              <small>
                {p === hand.villainPosition
                  ? `${hand.stack} BB iniciales`
                  : "Sin datos"}
              </small>
            )}
          </div>
        ))}
      </div>
      <p className="micro">
        Stack inicial declarado: {hand.stack} BB. Visualizador de estudio; el
        validador comprueba cartas, calles y aportaciones, no resuelve reglas
        avanzadas ni side pots.
      </p>
    </div>
  );
}
