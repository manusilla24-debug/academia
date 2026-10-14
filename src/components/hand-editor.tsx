"use client";
import type { Hand } from "@/lib/domain";
import { positions } from "@/lib/domain";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
export function HandEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  let h: Hand;
  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed !== "object" ||
      !Array.isArray(parsed.hero) ||
      !Array.isArray(parsed.board) ||
      !Array.isArray(parsed.actions) ||
      !Array.isArray(parsed.tags)
    )
      throw new Error();
    h = parsed as Hand;
  } catch {
    return (
      <p className="error-box">
        El JSON no tiene la estructura necesaria para el editor. Corrígelo en el
        formato avanzado o crea una mano nueva.
      </p>
    );
  }
  function change(patch: Partial<Hand>) {
    onChange(JSON.stringify({ ...h, ...patch }, null, 2));
  }
  function action(i: number, patch: Partial<Hand["actions"][number]>) {
    change({
      actions: h.actions.map((a, j) => (j === i ? { ...a, ...patch } : a)),
    });
  }
  return (
    <div className="hand-editor">
      <label>
        Título de la mano
        <input
          value={h.title ?? ""}
          onChange={(e) => change({ title: e.target.value })}
        />
      </label>
      <div className="two-cols">
        <label>
          Stakes
          <select
            value={h.stakes}
            onChange={(e) =>
              change({ stakes: e.target.value as Hand["stakes"] })
            }
          >
            {["NL2", "NL5", "NL10"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Stack inicial efectivo (BB)
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={h.stack ?? 0}
            onChange={(e) => change({ stack: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="two-cols">
        <label>
          Posición de Hero
          <select
            value={h.heroPosition}
            onChange={(e) =>
              change({ heroPosition: e.target.value as Hand["heroPosition"] })
            }
          >
            {positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Posición del rival
          <select
            value={h.villainPosition}
            onChange={(e) =>
              change({
                villainPosition: e.target.value as Hand["villainPosition"],
              })
            }
          >
            {positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="two-cols">
        <label>
          Cartas de Hero (As Qh)
          <input
            value={h.hero.join(" ")}
            onChange={(e) => change({ hero: e.target.value.split(" ") })}
          />
        </label>
        <label>
          Board (Kd 7c 2s…)
          <input
            value={h.board.join(" ")}
            onChange={(e) =>
              change({ board: e.target.value ? e.target.value.split(" ") : [] })
            }
          />
        </label>
      </div>
      <div className="two-cols">
        <label>
          Calle actual
          <select
            value={h.street}
            onChange={(e) =>
              change({ street: e.target.value as Hand["street"] })
            }
          >
            {["preflop", "flop", "turn", "river"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Bote actual (BB, incluidas ciegas)
          <input
            type="number"
            min="0"
            step="0.1"
            value={h.pot ?? 0}
            onChange={(e) => change({ pot: Number(e.target.value) })}
          />
        </label>
      </div>
      <h3>Acciones por calle</h3>
      <p className="micro">
        Cada tamaño es el importe adicional que entra al bote, también en raises
        y calls. El historial puede ser parcial; registra las ciegas iniciales
        en notas.
      </p>
      {h.actions.map((a, i) => (
        <div className="action-editor-row" key={i}>
          <select
            aria-label={`Calle de acción ${i + 1}`}
            value={a.street}
            onChange={(e) =>
              action(i, { street: e.target.value as Hand["street"] })
            }
          >
            {["preflop", "flop", "turn", "river"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            aria-label={`Posición de acción ${i + 1}`}
            value={a.position}
            onChange={(e) =>
              action(i, { position: e.target.value as Hand["heroPosition"] })
            }
          >
            {positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            aria-label={`Tipo de acción ${i + 1}`}
            value={a.action}
            onChange={(e) =>
              action(i, {
                action: e.target.value as Hand["actions"][number]["action"],
                size: ["check", "fold"].includes(e.target.value)
                  ? undefined
                  : a.size,
              })
            }
          >
            {["check", "fold", "call", "bet", "raise"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input
            aria-label={`BB añadidas en acción ${i + 1}`}
            type="number"
            min="0"
            step="0.1"
            disabled={["check", "fold"].includes(a.action)}
            value={a.size ?? ""}
            onChange={(e) =>
              action(i, {
                size: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <button
            className="icon-button"
            aria-label={`Eliminar acción ${i + 1}`}
            onClick={() =>
              change({ actions: h.actions.filter((_, j) => j !== i) })
            }
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          change({
            actions: [
              ...h.actions,
              { street: h.street, position: h.heroPosition, action: "check" },
            ],
          })
        }
      >
        <Plus size={14} /> Añadir acción
      </Button>
      <label>
        Notas del rival y contexto
        <textarea
          value={h.notes ?? ""}
          rows={3}
          onChange={(e) => change({ notes: e.target.value })}
        />
      </label>
      <label>
        Mi razonamiento
        <textarea
          value={h.reasoning ?? ""}
          rows={3}
          onChange={(e) => change({ reasoning: e.target.value })}
        />
      </label>
      <label>
        Mi duda principal
        <textarea
          value={h.question ?? ""}
          rows={2}
          onChange={(e) => change({ question: e.target.value })}
        />
      </label>
      <label>
        Etiquetas (separadas por coma)
        <input
          value={h.tags.join(",")}
          onChange={(e) => change({ tags: e.target.value.split(",") })}
        />
      </label>
    </div>
  );
}
