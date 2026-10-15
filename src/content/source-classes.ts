export interface SourceClass {
  title: string;
  objective: string;
  explanation: string;
  example: string;
  method: string[];
  practice: string;
}

/** Editorial teaching derived from the cited cues. Examples are explicitly hypothetical. */
export const sourceClasses: Record<string, SourceClass> = {
  "seleccion-preflop-nl2": {
    title: "NL2: elige tus manos por el rival, no por lo bonitas que parecen",
    objective:
      "Evaluar dominación y jugabilidad antes de entrar en un bote con una mano marginal.",
    explanation:
      "Una mano suited no tiene el mismo valor frente a todos los rangos. Si el rival abre fuerte, puedes ligar una pareja y seguir por detrás de su kicker. Si además juegas fuera de posición, realizar tu equity puede exigir pagar más apuestas o abandonar antes del river. Por eso el precio inmediato no basta para justificar una defensa.\n\nLa selección preflop conecta con todo lo que viene después. Un call necesita un plan contra el rango del agresor y contra los jugadores que quedan por hablar. Una 3-bet necesita saber si busca calls peores o folds de mejores. Si no identificas qué ventaja conservas, entrar en el bote puede limitarse a posponer una decisión difícil. El trabajo de esta clase es reconocer ese coste antes del flop.",
    example:
      "Ejemplo hipotético: tienes KJ suited frente a un open temprano. No damos por hecho que debas foldear o pagar: compara cómo juegas cuando ligas K frente a AK o KQ, qué proyectos puedes desarrollar y quién puede resubir por detrás. Si cambias el agresor por un rival que abre mucho más amplio, cambia también la evaluación; el aspecto de tu mano sigue siendo el mismo.",
    method: [
      "Anota posición y rango de apertura supuesto.",
      "Enumera las parejas dominadas que puedes ligar y la posición en que jugarás.",
      "Compara fold, call y resubida por su función, sin convertir suited en permiso automático.",
    ],
    practice:
      "Selecciona cinco calls preflop propios con broadways. Antes de ver el flop, escribe qué ventaja esperabas y qué tipo de pareja podía salir dominada.",
  },
  "clasificar-faroles": {
    title: "Qué convierte un proyecto en un buen candidato a farol",
    objective: "Separar una oportunidad de farol de una apuesta obligatoria.",
    explanation:
      "Un proyecto puede ganar de dos maneras: haciendo foldear ahora o mejorando cuando recibe call. Pero la segunda posibilidad no garantiza la primera. Para elegir un farol necesitamos relacionar nuestra equity con el rango rival, la textura, la posición y los tamaños.\n\nLa ventaja de rango describe cómo se comparan los rangos completos; no convierte todas sus manos en apuestas rentables. Un combo draw es una familia interesante para estudiar agresión, pero un raise puede cambiar el coste y la realización de su equity. Si el rival paga mucho, tendrás menos folds; si presiona con raises, debes saber cómo continuar. Clasificar la oportunidad es el comienzo del análisis, no su final.",
    example:
      "Ejemplo hipotético: dos manos tienen proyecto de color, pero una puede completar las nuts y la otra un color dominado. Aunque ambas tengan outs aparentes, no todas sus mejoras valen lo mismo. Compara además qué parejas mejores foldearían frente a tu tamaño. Si no encuentras folds plausibles, vuelve a estudiar check en lugar de forzar la etiqueta de semibluff.",
    method: [
      "Identifica folds de manos mejores, no solo manos peores que abandonan.",
      "Distingue mejoras limpias de proyectos que pueden quedar dominados.",
      "Planifica respuesta ante raise y turns de continuación antes de apostar.",
    ],
    practice:
      "Compara tres proyectos de tus manos. Describe equity, folds objetivo y alternativa de check sin asignar porcentajes que no hayas calculado.",
  },
  "diagnosticar-barrels": {
    title: "¿Estás apostando demasiado el turn? Aprende a comprobarlo",
    objective:
      "Convertir una sospecha de exceso de barrels en una revisión de decisiones concretas.",
    explanation:
      "Una estadística puede señalar dónde mirar, pero no explica por sí sola por qué una apuesta era buena o mala. Un segundo barrel puede buscar valor, folds o negación de equity. Para evaluarlo necesitas el board, la carta de turn, el rival y el rango que pagó flop. Perder la mano no distingue esos motivos.\n\nEmpieza por una familia comparable: por ejemplo, botes subidos una vez en posición. Incluye barrels ganados, perdidos y checks que pudieran haber sido apuestas. Después pregunta si los calls peores siguen existiendo y si las manos mejores realmente abandonan. Copiar la frecuencia de otro alumno evita ese análisis y puede introducir un ajuste que no responde a tus spots.",
    example:
      "Ejemplo hipotético: apuestas flop con dos overcards y el rival paga. El turn completa un proyecto que pesa en su defensa. Si tu única razón para continuar es «tengo la iniciativa», falta un objetivo actual. En otro runout, una carta favorable a tu rango puede sostener un barrel. La diferencia es la situación, no si la mano acabó ganando.",
    method: [
      "Filtra spots comparables e incluye checks y excepciones.",
      "Clasifica cada apuesta como valor, farol o negación de equity.",
      "Busca un patrón de razonamiento repetido antes de llamarlo leak.",
    ],
    practice:
      "Revisa diez turns y escribe una frase: «apuesto porque estas manos pagan / estas mejores foldean». Si no puedes terminarla, compara check.",
  },
  "check-call-con-criterio": {
    title: "Check-call con un motivo: precio, mejoras y dinero futuro",
    objective:
      "Justificar un call con su precio y sus condiciones, en lugar de pagar para ver qué pasa.",
    explanation:
      "Chequear una mano con showdown o capacidad de mejora puede evitar convertirla en una apuesta que solo recibe calls de mejores. Pero después del check todavía hay que decidir si pagar la apuesta rival. El call necesita un precio, un rango y mejoras que realmente sirvan.\n\nLas outs no son todas limpias: completar una carta puede mejorar también al rival o dejarte dominado. Las implícitas tampoco son dinero garantizado. Para contar cobros futuros debe existir una razón para que el rival siga pagando cuando mejores. Si todavía quedan apuestas, no puedes tratar tu equity hasta river como si una sola apuesta comprara ver ambas cartas.\n\nLa clase conserva el criterio de precio y condiciones; los naipes y cifras de la mano original necesitan verificarse en el vídeo. Los cálculos del ejemplo siguiente son un ejercicio independiente.",
    example:
      "Ejemplo hipotético en river, sin apuestas futuras: bote de 10 BB y apuesta rival de 5 BB. El call cuesta 5 para disputar 20: umbral del 25%, sin rake ni empates. En turn el mismo precio no basta para decidir: aún faltan la realización de equity y la respuesta a una posible apuesta de river. No copies la cifra a una calle distinta sin revisar los supuestos.",
    method: [
      "Reconstruye bote, apuesta y coste real de continuar.",
      "Identifica las manos a las que ya ganas y las mejoras limpias.",
      "Separa el precio actual de cobros futuros hipotéticos y de apuestas futuras que tendrás que afrontar.",
    ],
    practice:
      "Revisa cinco check-calls. Escribe qué compraba cada call y qué harías ante una apuesta en la siguiente calle.",
  },
  "preparacion-y-exposicion": {
    title: "Preparar NL10: qué debes saber explicar antes de subir",
    objective:
      "Evaluar preparación técnica y condiciones personales sin convertir un calendario en una garantía.",
    explanation:
      "Preparar un nivel no consiste en acabar una lista de vídeos. Consiste en comprobar si puedes resolver manos nuevas con el mismo criterio que trabajas en las clases. Divide la preparación en situaciones: selección preflop, botes 3-beteados, elección de barrels, valor y defensa de river. La pregunta no es si recuerdas el título, sino si puedes explicar una decisión y una alternativa.\n\nLas condiciones personales también forman parte de un plan: cuánto tiempo puedes estudiar, cuándo dejar de jugar y cómo reaccionar cuando el nivel resulta incómodo. Un programa con un plazo llamativo no elimina estas preguntas ni prueba que una transición sea adecuada para ti. El material del canal sirve como punto de estudio; tus decisiones requieren evidencia propia.",
    example:
      "Ejemplo hipotético: has completado todas las clases de turn, pero ante cinco manos nuevas no consigues identificar qué cambia tras un call de flop. Esa dificultad señala una tarea concreta. Acabar el curso y dominar el concepto son hechos diferentes. Vuelve al nodo que falla, trabaja una muestra de manos y repite el ejercicio sin ayuda.",
    method: [
      "Lista situaciones que puedes explicar y las que todavía decides por intuición.",
      "Prueba la transferencia con manos nuevas ocultando resultados.",
      "Define condiciones de estudio, pausa y revisión antes de cambiar la dificultad.",
    ],
    practice:
      "Construye una hoja con tres columnas: lo explico, lo dudo, lo trabajaré. Elige una sola dificultad para el siguiente bloque de estudio.",
  },
  "3bet-ip-plan": {
    title: "Botes 3-beteados: cuándo conservar showdown y cuándo farolear",
    objective:
      "Distinguir la función de tu mano y reevaluar el plan con cada nueva carta.",
    explanation:
      "Una 3-bet preflop no te obliga a apostar todas las calles. En posición puedes conservar showdown tomando check o seleccionar una mano que busque folds como farol. Son funciones diferentes: una mano que gana a parte del aire rival puede perder ese valor al apostar si solo continúan mejores.\n\nAntes de hacer barrel, actualiza el rango que pagó. Una carta de turn puede darte equity adicional o reforzar sus proyectos y parejas. Planificar no significa prometer una tercera apuesta pase lo que pase: significa saber qué información te permite continuar y qué información te obliga a cambiar. El tamaño elegido y el SPR condicionan cuánto dinero comprometes con cada decisión.",
    example:
      "Ejemplo hipotético: tienes una pareja media tras hacer 3-bet. Si las manos peores foldean y las mejores pagan, apostar no obtiene valor. Check conserva la posibilidad de ganar a aire. Con otra mano sin showdown y un proyecto limpio, puedes estudiar agresión, pero necesitas identificar qué mejores abandonan y qué harás si resuben.",
    method: [
      "Clasifica showdown, valor o candidata a farol.",
      "Describe el rango que continúa frente al tamaño que propones.",
      "Actualiza el plan con la carta nueva y el stack restante; no con el dinero ya invertido.",
    ],
    practice:
      "Toma tres botes 3-beteados IP. Escribe una línea de check y una de apuesta, y explica qué función cumple cada una.",
  },
};

export const additionalSourceNotes = [
  {
    slug: "descontar-rangos",
    videoId: "49tfDyPx_IA",
    title: "Descontar manos del rango sin borrarlas por intuición",
    module: "Laboratorio de manos · Lectura de rangos",
    from: 145,
    to: 220,
    summary:
      "La lectura de rangos combina acciones y blockers. Una acción puede hacer menos probable cierta mano, pero no demuestra que sea imposible. Si un rival chequea flop, conserva algunas manos fuertes salvo que tengas evidencia específica de que siempre las apuesta. Tus cartas reducen combinaciones disponibles, sin eliminar una familia entera.\n\nAl actualizar un rango, separa dos razones: cartas que ya no están disponibles y manos cuyo peso cambia por la línea. No son la misma evidencia. Después compara tu apuesta con el rango que paga, no con una mano que has adivinado. Acertar un showdown no sustituye el procedimiento.\n\nEn una revisión, prueba la alternativa contraria a tu lectura: si el rival sí conserva top pair, ¿todavía tiene sentido la apuesta? Si la decisión solo funciona después de eliminar sin motivo todo el valor, tu modelo necesita revisión.",
    limits:
      "El ASR permite reconocer el razonamiento de descarte, pero no reconstruir con precisión board, rangos ni tamaños. Reducir pesos no equivale a eliminar todas las manos fuertes.",
    questions: [
      {
        prompt:
          "El rival chequea flop. ¿Puedes eliminar todas sus top pairs sin más evidencia?",
        options: [
          "Sí, porque siempre apostarían.",
          "No: puedes revisar su peso, pero no declararlas imposibles.",
          "Solo importa la mano que enseñe al final.",
        ],
        accepted: [1],
        explanation:
          "La acción modifica una hipótesis de rango. Los blockers eliminan combinaciones concretas; un check no elimina automáticamente familias completas.",
      },
    ],
  },
  {
    slug: "showdown-no-bluff",
    videoId: "49tfDyPx_IA",
    title: "No conviertas showdown en un farol sin darte cuenta",
    module: "Laboratorio de manos · River",
    from: 355,
    to: 410,
    summary:
      "Tener una mano que puede ganar al showdown no significa que debas apostar. La pregunta es qué mejora la apuesta respecto a chequear. Si tiras manos a las que ya ganas y solo pagan manos mejores, no has construido una apuesta de valor. Para defenderla como farol necesitas hacer abandonar suficientes manos mejores.\n\nUna apuesta pequeña tampoco se convierte automáticamente en una buena apuesta de bloqueo. Debes identificar qué calls peores recibes, qué precio eliges y cómo respondes ante raise. Si la razón es evitar una decisión incómoda, puedes estar pagando tú mismo por aislarte frente a un rango más fuerte.\n\nEjemplo hipotético: llegas a river con segunda pareja después de que el rival haya chequeado. Check gana contra parte de su aire. Apostar solo mejora el resultado si cobran suficientes manos peores o abandonan suficientes mejores. Antes de elegir, describe ambos rangos de respuesta.",
    limits:
      "La comparación entre showdown y bluff está respaldada por la explicación del intervalo. El ejemplo es editorial e hipotético; no reconstruye los naipes del vídeo.",
    questions: [
      {
        prompt:
          "Con una pareja apuestas y solo pagan manos mejores; las peores foldean. ¿Qué función falta justificar?",
        options: [
          "Que la apuesta cobre a peores o consiga suficientes folds de mejores frente a check.",
          "Ninguna: toda pareja apuesta por valor.",
          "Que hayas sido agresor preflop.",
        ],
        accepted: [0],
        explanation:
          "La fuerza de tu mano frente al rango inicial no basta. Importa cómo cambia el rango cuando apuestas.",
      },
    ],
  },
  {
    slug: "barrel-backdoors",
    videoId: "k2TKWYydslc",
    title: "Antes de la c-bet: qué turns te permiten continuar",
    module: "Laboratorio de manos · Turn",
    from: 410,
    to: 455,
    summary:
      "Una c-bet de farol se entiende mejor cuando incluye las cartas de continuación. Los backdoors son posibilidades de mejora que todavía requieren dos cartas; pueden dar buenos turns para seguir presionando, pero no equivalen a un proyecto ya formado. La mano elegida también debe relacionarse con las manos que impactan el board y con el perfil que las defiende.\n\nUn blocker puede reducir algunas continuaciones del rival. Aun así, la apuesta necesita folds y una línea posterior coherente. Frente a alguien que paga demasiado, el mismo candidato puede realizar mejor su equity chequeando. Frente a un rival que abandona una parte amplia de su rango, cambia la oportunidad.\n\nEjemplo hipotético: comparas dos manos sin pareja. Una puede adquirir proyecto fuerte en varios turns y la otra apenas mejora. Eso ayuda a elegir candidatos, pero no obliga a apostar ninguna. Completa el análisis escribiendo qué manos mejores foldean y qué harás si pagan o resuben.",
    limits:
      "El intervalo explica backdoors, perfil y continuación. Los naipes del ASR son ambiguos; no se publican una c-bet automática, frecuencias o una reconstrucción del board.",
    questions: [
      {
        prompt: "¿Qué debe acompañar a la elección de un farol con backdoors?",
        options: [
          "Una promesa de tres barrels con cualquier carta.",
          "Folds objetivo, turns favorables y respuesta ante call o raise.",
          "Solo el hecho de no tener pareja.",
        ],
        accepted: [1],
        explanation:
          "Los backdoors ayudan a planificar la continuación; no reemplazan el análisis del rival ni el objetivo de la apuesta.",
      },
    ],
  },
  {
    slug: "no-forzar-proyecto",
    videoId: "1Y2f_FdnfXM",
    title: "Un proyecto débil no te obliga a farolear",
    module: "Laboratorio de manos · Selección de faroles",
    from: 2680,
    to: 2848,
    summary:
      "Hay manos que apenas pueden mejorar de forma cómoda y aun así conservan alguna posibilidad de showdown. Apostarlas por no tener una mano fuerte puede juntar dos problemas: escasos folds del rival y mejoras que no son limpias. El primer filtro es reconocer qué función tendría la apuesta.\n\nUn proyecto a un color bajo en una textura peligrosa no equivale a un proyecto a las nuts. Algunas cartas que parecen ayudarte pueden dar al rival un color mejor o una mano más fuerte. Si además paga demasiado, tu equity limitada no compensa automáticamente la falta de fold equity. Comparar check no es una renuncia: puede conservar las opciones de tu mano con menor inversión.\n\nTambién cambia el plan frente a perfiles distintos. Una apuesta pequeña que no consigue suficiente fold inmediato puede necesitar continuaciones posteriores, pero no debes inventarlas después de pagar el coste inicial. Antes de apostar, anota las cartas y respuestas que sostienen la línea. Si no puedes explicar el plan, vuelve al check como alternativa de estudio.",
    limits:
      "Intervalo seleccionado de una sesión mixta. Solo se trabaja el principio conceptual de selección de faroles; no se trasladan rangos, tamaños o estrategia de torneos a cash. No se reconstruyen las cartas ambiguas del ASR.",
    questions: [
      {
        prompt:
          "Tienes un proyecto dominable y el rival paga demasiado. ¿Qué conclusión es defendible?",
        options: [
          "Apostar siempre porque toda equity exige agresión.",
          "Comparar check y agresión según mejoras limpias, folds plausibles y plan posterior.",
          "Apostar tres calles porque ya no hay showdown seguro.",
        ],
        accepted: [1],
        explanation:
          "Un proyecto no basta para justificar el farol. La dominación y la falta de folds pueden hacer más interesante conservar equity con check.",
      },
    ],
  },
];
