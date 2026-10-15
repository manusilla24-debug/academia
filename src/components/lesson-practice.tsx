"use client";
import { useState } from "react";
import { ArrowRight, Check, Target } from "lucide-react";
import type { Exercise, Lesson } from "@/lib/domain";
import { orderedLessons } from "@/lib/learning";
import { Badge, type Context } from "./lab";
import { Button } from "./ui/button";

function Question({ exercise: e, ...ctx }: Context & { exercise: Exercise }) {
  const [choice, setChoice] = useState<number>();
  const [answered, setAnswered] = useState(false);
  return (
    <div className="inline-question">
      <h4>{e.prompt}</h4>
      <div className="exercise-options" role="group" aria-label={e.prompt}>
        {e.options.map((option, i) => (
          <button
            className={`exercise-option ${choice === i ? "chosen" : ""} ${answered && e.accepted.includes(i) ? "correct" : ""}`}
            key={option}
            aria-pressed={choice === i}
            disabled={ctx.busy || answered}
            onClick={() => setChoice(i)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {option}
            {answered && e.accepted.includes(i) && <Check size={16} />}
          </button>
        ))}
      </div>
      {answered ? (
        <div className="feedback" role="status">
          <Badge green={e.accepted.includes(choice!)}>
            {e.accepted.includes(choice!)
              ? "Respuesta aceptada"
              : "Revisa el razonamiento"}
          </Badge>
          <p>{e.explanation}</p>
          <button
            className="text-button"
            onClick={() => {
              setAnswered(false);
              setChoice(undefined);
            }}
          >
            Volver a intentarlo
          </button>
        </div>
      ) : (
        <Button
          disabled={choice === undefined || ctx.busy}
          onClick={async () => {
            if (await ctx.act({ op: "attempt", exerciseId: e.id, choice }))
              setAnswered(true);
          }}
        >
          Comprobar mi razonamiento
          <ArrowRight size={14} />
        </Button>
      )}
    </div>
  );
}

export function LessonPractice({
  lesson,
  ...ctx
}: Context & { lesson: Lesson }) {
  if (lesson.status !== "published") return null;
  const exercises = ctx.s.exercises.filter(
    (e) => e.lessonId === lesson.id && e.kind !== "pendiente",
  );
  const lessons = orderedLessons(ctx.s);
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const next = lessons[index + 1];
  return (
    <section className="lesson-practice" aria-label="Práctica de la clase">
      <div className="section-heading">
        <div>
          <span className="eyebrow">AHORA TE TOCA A TI</span>
          <h3>
            <Target size={19} /> Del concepto a la decisión
          </h3>
        </div>
        <span className="micro">{exercises.length} ejercicios</span>
      </div>
      {exercises.length ? (
        exercises.map((e) => <Question {...ctx} exercise={e} key={e.id} />)
      ) : (
        <p>
          Relaciona esta clase con una mano propia y explica el objetivo de tu
          acción. Puedes preparar ejercicios desde «Aplicar y recordar».
        </p>
      )}
      {next && (
        <button
          className="next-class-link"
          onClick={() => ctx.navigate("academy", next.id)}
        >
          <span>
            <small>SIGUIENTE CLASE</small>
            <strong>{next.title}</strong>
          </span>
          <ArrowRight size={19} />
        </button>
      )}
    </section>
  );
}
