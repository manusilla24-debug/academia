import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type State, now, exerciseSchema, handSchema } from "./domain";
import { addTranscript } from "./pipeline";
export function seedDemo(s: State) {
  if (s.videos.some((v) => v.id === "demo_video")) return false;
  const createdAt = now();
  s.videos.push({
    id: "demo_video",
    title: "DEMO · Laboratorio de decisiones cash 6-max",
    demo: true,
    relevant: true,
    tags: ["NL2", "NL5", "flop", "turn", "river"],
    status: "published",
    duration: 240,
    createdAt,
  });
  const t = addTranscript(
    s,
    "demo_video",
    readFileSync(resolve("fixtures/demo.es.srt"), "utf8"),
    "demo.es.srt",
  );
  s.videos[s.videos.findIndex((v) => v.id === "demo_video")].status =
    "published";
  const segmentIds = s.segments
    .filter((g) => g.transcriptId === t.id)
    .map((g) => g.id);
  const lessons = [
    {
      id: "demo_lesson_flop",
      title: "C-bet: construir un plan, no pulsar un botón",
      module: "Single-raised pots IP",
      body: "El problema\n\nAbrir BTN y recibir call de BB no te da una licencia para apostar cualquier flop. En un board 8h 7h 6c, el rango de BB puede conservar muchas manos conectadas. Antes de elegir bet, pregunta qué consigue la apuesta con esta combinación y qué parte de tu rango necesita protección.\n\nPensar por rangos\n\nSepara valor que puede recibir calls de manos peores, faroles con equity o blockers útiles y manos que prefieren check. Un check también preserva showdown y permite proteger el rango de check. No se propone una frecuencia GTO: faltan rangos de open/call y estructura de rake.\n\nCondiciones y excepciones\n\nContra un rival que foldea demasiado, puedes ampliar selectivamente los faroles; contra quien paga demasiado, busca valor y reduce faroles débiles. Evita convertir una impresión de dos manos en una lectura segura.\n\nAplicación\n\nAntes de c-bet, escribe: ventaja de rango, ventaja de nuts, manos peores que pagan, manos mejores que foldean y plan ante check-raise. Revisa el turn antes de apostar el flop.",
      quote: t.cues[0].text,
    },
    {
      id: "demo_lesson_turn",
      title: "Second barrel: elegir turns y rivales",
      module: "Juego en turn",
      body: "El problema\n\nEl segundo barrel debe continuar una historia de rangos coherente. No basta con que una overcard parezca intimidante: considera cuánto mejora tu rango y cuánto conecta con el rango que pagó flop.\n\nPlan de decisión\n\nCon una mano de valor, identifica calls de manos peores. Con un farol, busca equity al ser pagado, blockers pertinentes y fold equity. Con showdown medio, considera check si apostar solo aísla contra mejores.\n\nAjuste explotativo\n\nSi el rival paga demasiado, la adaptación razonable es priorizar valor y reducir faroles sin equity. La lectura debe tener incertidumbre explícita; no inventes estadísticas para justificarla.\n\nEjemplo de razonamiento\n\nUn proyecto de color que no completa puede conservar equity en turn. Eso no obliga a apostar: el tamaño del bote, el SPR, los outs limpios y el rango rival condicionan la elección.\n\nAutoevaluación\n\n¿Qué cambia este turn? ¿Qué parte del rango rival foldea? ¿Qué haré en los rivers que completan y en los que no?",
      quote: t.cues[1].text,
    },
    {
      id: "demo_lesson_river",
      title: "Bluffcatching: qué rango estás pagando",
      module: "Bluffcatching",
      body: "El problema\n\nUn bluffcatcher gana sobre todo a faroles. La fuerza absoluta de tu pareja no basta: compara esa mano con el rango que el rival apuesta después de su línea completa.\n\nSelección de combinaciones\n\nUn blocker de valor puede mejorar un call, mientras que bloquear proyectos fallidos puede retirar faroles del rango rival. Es una dirección de razonamiento, no una regla que sustituya al análisis de rangos.\n\nRival y tamaño\n\nUna línea grande de un perfil pasivo merece cautela bajo una hipótesis explotativa de pocos faroles. Conserva la incertidumbre cuando no tienes muestra suficiente. No se atribuyen frecuencias ni EV exactos.\n\nErrores frecuentes\n\nPagar porque «está arriba de mi rango» sin estudiar cómo llegaste al river. Foldear todos los bluffcatchers por una única mano anterior. Cambiar el análisis al conocer el resultado.\n\nPráctica fuera de sesión\n\nOculta el resultado. Enumera valor y faroles plausibles, revisa blockers y registra qué supuestos cambiarían tu decisión.",
      quote: t.cues[2].text,
    },
  ];
  for (const l of lessons) {
    const cId = `concept_${l.id}`;
    s.concepts.push({
      id: cId,
      videoId: "demo_video",
      title: l.title,
      explanation: l.body,
      quote: l.quote,
      segmentIds,
      kind: "extracto",
      conditions: [
        "Material editorial DEMO para práctica; no procede del canal.",
      ],
      warnings: ["Heurísticas sin frecuencias ni EV de solver."],
      topic: l.module,
      version: "demo-v1",
      createdAt,
    });
    s.lessons.push({
      id: l.id,
      videoId: "demo_video",
      title: l.title,
      module: l.module,
      body: l.body,
      level: "Intermedio · NL2 / NL5",
      objectives: [
        "Formular un plan por rangos.",
        "Explicitar los supuestos del rival.",
      ],
      prerequisites: ["Juego cash y posiciones conocidas."],
      conceptIds: [cId],
      segmentIds,
      status: "published",
      confidence: "DEMO editorial · heurística",
      version: 1,
      reviewedAt: createdAt,
      demo: true,
    });
    const id = `card_${l.id}`;
    s.cards.push({
      id,
      lessonId: l.id,
      front: `¿Qué condiciones debes revisar en «${l.title}»?`,
      back: l.body,
      segmentIds,
      demo: true,
    });
    s.reviews.push({
      id: `review_${id}`,
      cardId: id,
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      due: createdAt,
      history: [],
    });
  }
  const cases = [
    {
      lessonId: lessons[0].id,
      prompt:
        "BTN vs BB, 100 BB efectivos, NL5. BTN abre 2,5 BB; SB foldea y BB paga. Flop 8h 7h 6c, bote 5,5 BB, BB check. Hero Ac Qd. Sin reads fiables, ¿qué plan es defendible?",
      options: [
        "Considerar check, estudiar la conectividad del rango de BB y preservar showdown.",
        "Apostar grande siempre porque BTN tiene ventaja preflop.",
        "Convertir cualquier overcard en un farol de tres calles.",
      ],
      accepted: [0],
      explanation:
        "En una textura baja conectada, BB puede conservar manos fuertes y proyectos. Check con esta combinación sin backdoor de color es una heurística defendible, no una solución universal.",
      assumptions: [
        "Rangos de open/call y rake sin especificar.",
        "No es una frecuencia GTO calculada.",
      ],
    },
    {
      lessonId: lessons[1].id,
      prompt:
        "Has apostado flop con un proyecto y el rival paga. El turn no completa. ¿Qué información justifica estudiar un second barrel?",
      options: [
        "Equity al ser pagado, cambios de rangos, blockers, fold equity y tamaño.",
        "Que llevas dos manos sin ganar un bote.",
        "Que apostar flop obliga a apostar turn.",
      ],
      accepted: [0],
      explanation:
        "El barrel necesita un objetivo y un plan de river. Mantener un proyecto no convierte cualquier tamaño o rival en una apuesta rentable.",
      assumptions: ["Pregunta conceptual: no hay board ni rangos concretos."],
    },
    {
      lessonId: lessons[2].id,
      prompt:
        "En river tu pareja solo gana a faroles. ¿Cómo puede afectar tener una carta del proyecto de color fallido?",
      options: [
        "Puede bloquear faroles del rival y empeorar el call, según sus rangos.",
        "Siempre mejora el call porque es un blocker.",
        "Garantiza que el rival tenga una mano de valor.",
      ],
      accepted: [0],
      explanation:
        "Bloquear faroles puede reducir las combinaciones a las que ganas. Debes estudiar la línea y las manos de valor que también bloqueas.",
      assumptions: [
        "Composición del rango desconocida; evaluación cualitativa.",
      ],
    },
    {
      lessonId: lessons[1].id,
      prompt:
        "Tienes una lectura provisional de que un recreacional paga demasiado. ¿Qué adaptación estudiarías?",
      options: [
        "Priorizar valor y reducir faroles sin equity, manteniendo explícita la incertidumbre.",
        "Aumentar todos los faroles para compensar los calls.",
        "Usar la lectura como certeza después de una sola mano.",
      ],
      accepted: [0],
      explanation:
        "Una menor fold equity reduce la justificación de faroles débiles. La explotación depende de que la lectura sea válida.",
      assumptions: ["Lectura hipotética, no estadística observada."],
    },
    {
      lessonId: lessons[2].id,
      prompt:
        "Un rival al que consideras pasivo hace un check-raise grande. ¿Qué análisis resulta razonable antes de continuar?",
      options: [
        "Revisar rangos de valor, proyectos y tamaño, con cautela si la hipótesis de pocos faroles se sostiene.",
        "Pagar siempre por estar en la parte alta de tu rango.",
        "Concluir que todos los rivales de NL2 nunca farolean.",
      ],
      accepted: [0],
      explanation:
        "La hipótesis explotativa merece cautela, pero no demuestra una estrategia universal. Faltan muestra, board y línea para prescribir un call o fold exacto.",
      assumptions: ["No hay datos suficientes para una solución específica."],
    },
  ];
  for (const [i, e] of cases.entries())
    s.exercises.push(
      exerciseSchema.parse({
        ...e,
        id: `demo_exercise_${i}`,
        segmentIds,
        difficulty: "intermedio",
        kind: "heurística",
        demo: true,
      }),
    );
  s.hands.push({
    ...handSchema.parse({
      title: "DEMO · Thin value en river",
      stakes: "NL5",
      heroPosition: "BTN",
      villainPosition: "BB",
      stack: 100,
      pot: 17.5,
      hero: ["As", "Jd"],
      board: ["Jh", "7c", "2s", "4d", "9c"],
      street: "river",
      actions: [
        { street: "preflop", position: "BTN", action: "bet", size: 2.5 },
        { street: "preflop", position: "BB", action: "call", size: 1.5 },
        { street: "flop", position: "BTN", action: "bet", size: 2 },
        { street: "flop", position: "BB", action: "call", size: 2 },
        { street: "turn", position: "BB", action: "check" },
        { street: "turn", position: "BTN", action: "check" },
        { street: "river", position: "BB", action: "check" },
        { street: "river", position: "BTN", action: "bet", size: 4 },
        { street: "river", position: "BB", action: "call", size: 4 },
      ],
      notes:
        "Rival ficticio, sin estadísticas. SB aporta 0,5 y foldea; BB inicial 1. Bote inicial 1,5 BB.",
      reasoning:
        "Explorar qué Jx y parejas inferiores pueden pagar un tamaño pequeño.",
      question: "¿Qué manos peores pagan y qué cambia frente a un check-raise?",
      tags: ["thin value", "DEMO"],
      demo: true,
    }),
    id: "demo_hand",
    createdAt,
  });
  s.leaks.push({
    id: "demo_leak",
    title: "DEMO · Plan de turn poco explícito",
    notes:
      "Ejemplo editorial basado en la duda registrada en la mano ficticia. No es un leak estadísticamente demostrado.",
    severity: "media",
    uncertainty: "Alta: una sola mano ficticia",
    worked: false,
    evidenceIds: ["demo_hand"],
    lessonIds: [lessons[1].id],
    history: [`${createdAt}: ejemplo añadido`],
    demo: true,
  });
  return true;
}
