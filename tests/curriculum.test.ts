import { describe, it, expect } from "vitest";
import { emptyState, exerciseSchema } from "../src/lib/domain";
import { installCurriculum } from "../src/lib/curriculum";
describe("ruta editorial utilizable", () => {
  it("conecta 24 clases con 48 ejercicios, repaso y fuente escrita sin atribuirla al canal", () => {
    const s = emptyState();
    expect(installCurriculum(s)).toBe(true);
    expect(s.lessons).toHaveLength(24);
    expect(s.exercises).toHaveLength(48);
    expect(s.cards).toHaveLength(24);
    expect(s.reviews).toHaveLength(24);
    expect(s.videos[0].sourceType).toBe("editorial");
    expect(s.videos[0].url).toBeUndefined();
    for (const c of s.concepts)
      expect(
        c.segmentIds.some((id) =>
          s.segments.find((g) => g.id === id)?.text.includes(c.quote),
        ),
      ).toBe(true);
    for (const e of s.exercises) {
      expect(exerciseSchema.safeParse(e).success).toBe(true);
      expect(s.lessons.some((l) => l.id === e.lessonId)).toBe(true);
    }
    s.lessons[0].body = "Edición personal";
    expect(installCurriculum(s)).toBe(false);
    expect(s.lessons[0].body).toBe("Edición personal");
  });
});
