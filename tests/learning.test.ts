import { describe, expect, it } from "vitest";
import { emptyState } from "../src/lib/domain";
import { installCurriculum } from "../src/lib/curriculum";
import { cashCourse } from "../src/content/cash-course";
import { nextLesson, orderedLessons, pathFor } from "../src/lib/learning";

describe("recorrido de aprendizaje", () => {
  it("empieza por la estrategia y reanuda una clase real pendiente", () => {
    const s = emptyState();
    installCurriculum(s);
    expect(nextLesson(s)?.id).toBe("academy_estrategia-academia");
    s.progress.push({
      id: "p",
      lessonId: "academy_no-bluffcatch-nl2",
      completed: false,
      favorite: false,
      notes: "repasar precio",
      updatedAt: "2026-10-15T12:00:00Z",
    });
    expect(nextLesson(s)?.id).toBe("academy_no-bluffcatch-nl2");
    s.progress[0].completed = true;
    expect(nextLesson(s)?.id).toBe("academy_estrategia-academia");
    expect(new Set(orderedLessons(s).map((l) => pathFor(l).id)).size).toBe(4);
  });
  it("actualiza el texto original v1 y conserva historial, notas y ediciones personales", () => {
    const s = emptyState();
    installCurriculum(s);
    const u = cashCourse[0];
    const first = s.lessons[0];
    first.version = 1;
    first.body = `Material editorial propio. No procede del canal ni es una solución de solver.\n\n${u.theory}\n\nProceso de decisión\n\n${u.method.map((v, n) => `${n + 1}. ${v}`).join("\n\n")}\n\nCondiciones y límites\n\n${u.limits}\n\nAplicación fuera de sesión\n\n${u.practice}\n\nAutoevaluación\n\n${u.questions.map((q) => q.prompt).join("\n\n")}`;
    const original = first.body;
    const second = s.lessons[1];
    second.version = 1;
    second.body = "Mi explicación personal no debe reemplazarse.";
    s.progress.push({
      id: "p",
      lessonId: first.id,
      completed: true,
      favorite: true,
      notes: "Mi nota privada",
      updatedAt: "2026-10-15T12:00:00Z",
    });
    const exercises = s.exercises.map((e) => e.id);
    expect(installCurriculum(s)).toBe(true);
    expect(first.body).toContain("Un ejemplo razonado");
    expect(first.revisions?.[0].body).toBe(original);
    expect(second.body).toBe("Mi explicación personal no debe reemplazarse.");
    expect(s.progress[0].notes).toBe("Mi nota privada");
    expect(s.progress[0].completed).toBe(true);
    expect(s.exercises.map((e) => e.id)).toEqual(exercises);
    expect(installCurriculum(s)).toBe(false);
  });
});
