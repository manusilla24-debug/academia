import type { StudyUnit } from "./cash-course";

/** Original teaching material. Examples are hypothetical, never reconstructed video hands. */
export const academyCourse: StudyUnit[] = [
  {
    slug: "estrategia-academia",
    title: "La estrategia de la academia: primero valor, después ajustes",
    area: "Nuestra estrategia",
    objective:
      "Construir un plan de cash que empiece por el rival y termine en una decisión explicable.",
    theory:
      "En esta clase aprenderemos a ordenar nuestras decisiones. El punto de partida de esta ruta es sencillo: seleccionar manos con un plan, apostar por un motivo y cambiar la estrategia cuando tenemos evidencia de cómo responde el rival. No necesitamos ganar todos los botes. Necesitamos distinguir los botes en los que podemos cobrar, aquellos en los que podemos hacer foldear una mano mejor y aquellos en los que conservar nuestra equity es suficiente.\n\nValor significa que esperamos que nos paguen manos peores. Farol significa que necesitamos que abandonen suficientes manos mejores. Showdown significa que nuestra mano puede ganar sin aumentar el bote. Una pareja media no se convierte en apuesta de valor solo por estar por delante del rango completo del rival: importa el rango que paga. Esta diferencia es la base del curso.\n\nEn NL2 estudiaremos especialmente cómo dejar de regalar apuestas sin objetivo y calls sin justificación. Eso no equivale a prohibir el farol o a foldear siempre river. Si un rival paga demasiado, estudiaremos más valor y menos faroles; si abandona demasiadas manos, estudiaremos cómo presionarlo. Cada ajuste lleva una condición, y no una etiqueta sobre todos los jugadores del nivel.",
    method: [
      "Describe posiciones, stack efectivo, bote y perfil observado. Si falta un dato, escríbelo como supuesto.",
      "Clasifica tu mano: valor, proyecto, showdown o candidata a farol. Compara apuesta y check contra el rango que realmente continúa.",
      "Antes de invertir otra apuesta, identifica qué cambia en la siguiente calle y cuándo abandonarás el plan.",
    ],
    limits:
      "Esta es la propuesta editorial de esta academia personal. Las ideas procedentes del canal se identifican con su fuente; no se presenta esta ruta como el método oficial del profesor ni como una tabla resuelta.",
    practice:
      "Busca tres manos: una apuesta de valor, un farol y un check. Escribe qué calls peores esperabas, qué manos mejores querías tirar o qué showdown conservabas. Si no puedes responder, esa mano merece revisión.",
    questions: [
      {
        prompt:
          "Tienes segunda pareja y el rival foldea todas sus manos peores, pero paga con mejores. ¿Por qué apostar no es automáticamente valor?",
        options: [
          "Porque ser favorito contra el rango completo no significa serlo contra el rango que paga.",
          "Porque una segunda pareja nunca puede apostar.",
          "Porque el tamaño del bote decide por sí solo.",
        ],
        accepted: [0],
        explanation:
          "El valor se evalúa contra las manos que continúan. Check puede conservar showdown sin aislarte contra mejores.",
      },
      {
        prompt:
          "Un rival concreto paga tres calles con parejas débiles repetidamente. ¿Qué ajuste estudiarías?",
        options: [
          "Farolear más porque parece débil.",
          "Ampliar valor cuando existan calls peores y reducir faroles que necesitan sus folds.",
          "Aplicar el mismo ajuste a todos los rivales de NL2.",
        ],
        accepted: [1],
        explanation:
          "El ajuste responde a una conducta observada y a un nodo concreto. No transforma una lectura individual en una ley del nivel.",
      },
    ],
  },
  {
    slug: "no-bluffcatch-nl2",
    title: "Por qué no pagar de más en NL2: el bluffcatch con criterio",
    area: "Nuestra estrategia",
    objective:
      "Distinguir un bluffcatch defendible de un call por curiosidad, rabia o miedo a que te engañen.",
    theory:
      "En la clase de hoy aprenderemos por qué pagar para descubrir si el rival lleva un farol puede costarnos muchas apuestas. Un bluffcatcher gana a los faroles y pierde contra las apuestas de valor. Por eso no basta con decir «tengo top pair»: necesitamos saber qué manos apuesta el rival y con qué proporción llegan los faroles.\n\nEjemplo hipotético: el bote contiene 10 BB y el rival apuesta 10 BB en river. Pagar cuesta 10 para disputar 30 BB finales. Necesitamos ganar un tercio de las veces para quedar a cero, sin rake. Si solo ganamos contra faroles, su rango de apuesta debe contener al menos un tercio de manos a las que ganamos. La fórmula es call / (bote antes de apostar + apuesta rival + call). No se trata de la probabilidad de que «pueda» estar faroleando, sino de cuánto peso tienen esas manos frente al valor.\n\nAhora reconstruye la línea. ¿Qué proyectos fallaron? ¿Llegan hasta river? ¿Los apuesta este rival? ¿Hay manos que parecen faroles pero toman check? Un proyecto fallido sobre la mesa no es evidencia de que lo convierta en apuesta. Bloquear un farol plausible puede empeorar tu call, aunque tu mano sea bonita. Un blocker de valor ayuda solo cuando afecta a suficientes combinaciones relevantes.\n\nLa regla práctica es evitar el call automático sin identificar suficientes manos a las que ganamos. Ante una línea que sospechamos cargada de valor, estudiaremos el fold y contrastaremos esa sospecha con manos reales. No afirmamos que NL2 nunca farolee. Contra un rival que sí llega con faroles suficientes, foldear todos los bluffcatchers también sería un error.",
    method: [
      "Calcula el precio del call. A medio bote necesitas ganar el 25%; a bote, un tercio; a doble bote, el 40%, antes de rake.",
      "Escribe las familias de valor y los faroles que llegan por esa secuencia. No añadas proyectos que habrían foldeado antes.",
      "Comprueba la lectura del rival y tus blockers. Si tu explicación solo es «puede tener un farol», aún no has justificado el call.",
    ],
    limits:
      "Los porcentajes son umbrales aritméticos de un call que cierra la acción, sin rake, empates ni apuestas futuras. No estiman la frecuencia de farol real de NL2. Los ejemplos son originales.",
    practice:
      "Revisa diez calls de river ocultando el showdown. Anota precio, valor, faroles plausibles y evidencia. Descubre el resultado después. Un farol mostrado no convierte todos los calls de esa familia en buenos.",
    questions: [
      {
        prompt:
          "Bote de 10 BB, apuesta rival de 10 BB y call de 10 BB que cierra la acción. Sin rake ni empates, ¿cuánto necesitas ganar?",
        options: ["El 50%.", "Un tercio de las veces.", "El 10%."],
        accepted: [1],
        explanation:
          "Arriesgas 10 para disputar un bote final de 30. El umbral es 10/30, no 10/20.",
      },
      {
        prompt:
          "Falló el proyecto de color en river. ¿Qué falta para justificar un bluffcatch?",
        options: [
          "Nada: todo proyecto fallido se farolea.",
          "Que tu mano haya ganado la última vez.",
          "Que ese proyecto llegue por la línea y el rival lo apueste con suficiente frecuencia frente al valor.",
        ],
        accepted: [2],
        explanation:
          "La existencia de proyectos fallidos no determina la composición del rango que apuesta.",
      },
    ],
  },
  {
    slug: "valor-nl2",
    title: "Cobrar tus manos fuertes sin espantar todos los calls peores",
    area: "Nuestra estrategia",
    objective:
      "Relacionar el tamaño de valor con las manos peores que pueden pagar.",
    theory:
      "En esta clase aprenderemos a dejar de apostar tamaños por costumbre. Una mano fuerte quiere construir un bote, pero el tamaño solo funciona si hay manos peores que continúan. Antes de elegirlo, nombra esas manos: parejas peores, top pairs con peor kicker, proyectos o dobles inferiores. Después pregunta qué cambia entre apostar un tercio, dos tercios o bote.\n\nEjemplo hipotético: abres BTN, BB paga y tienes AQ en A-7-2 rainbow. No sabemos qué frecuencia es óptima sin rangos, pero podemos comparar planes. Un tamaño pequeño podría recibir calls de parejas débiles que abandonarían contra uno grande. Contra alguien que paga cualquier tamaño con un as peor, un tamaño mayor puede tener sentido. En cambio, si el turn completa proyectos que pesan mucho en su rango, no seguimos cobrando como si nada hubiera cambiado.\n\nThin value es una apuesta de valor más ajustada: hay menos calls peores y el riesgo de aislarte contra mejores aumenta. No lo confundas con una apuesta de bloqueo sin objetivo. También necesitas un plan ante raise: que el rival pague demasiado no implica que resuba de farol demasiado. Valor y defensa frente a agresión son decisiones diferentes.",
    method: [
      "Lista al menos dos familias peores que pagan. Si solo encuentras mejores, vuelve a comparar con check.",
      "Compara cómo cambia su rango de call al aumentar el tamaño. Observa elasticidad, stack efectivo y las calles que quedan.",
      "Define de antemano qué harás ante raise y qué runouts reducen tu valor.",
    ],
    limits:
      "No se prescribe una frecuencia o tamaño universal para A72. La lectura de calls y raises exige evidencia separada; los ejemplos no son manos del canal.",
    practice:
      "Agrupa cinco apuestas de river por valor. Escribe qué manos peores pagarían cada tamaño. Revisa también manos fuertes que chequeaste: estudiar solo botes perdidos deja fuera oportunidades de valor.",
    questions: [
      {
        prompt:
          "Un rival paga muy amplio pero sus raises observados son fuertes. Apuestas por valor y resube. ¿Qué debes evitar?",
        options: [
          "Separar rango de call y rango de raise.",
          "Suponer que por pagar mal también resube de farol demasiado.",
          "Reevaluar la fuerza relativa de tu mano.",
        ],
        accepted: [1],
        explanation:
          "Una tendencia a pagar no demuestra una tendencia a farolear subiendo. Son nodos distintos.",
      },
      {
        prompt: "¿Qué pregunta guía una apuesta de thin value?",
        options: [
          "¿Qué manos peores pagan este tamaño?",
          "¿Puedo ganar el bote antes?",
          "¿He perdido los tres botes anteriores?",
        ],
        accepted: [0],
        explanation:
          "El thin value depende del rango que paga y del precio, no de una racha ni del deseo de terminar la mano.",
      },
    ],
  },
  {
    slug: "farol-con-plan",
    title: "Farolear con un plan: a quién, con qué mano y hasta dónde",
    area: "Nuestra estrategia",
    objective:
      "Seleccionar un farol por sus folds plausibles y sus continuaciones, sin encadenar apuestas por inercia.",
    theory:
      "En esta clase aprenderemos por qué no tener showdown no obliga a farolear. La mano adecuada necesita un objetivo: qué parte del rango mejor puede foldear al tamaño elegido. Si el rival paga demasiado, que nuestra mano sea mala no crea folds. Si el rival abandona mucho, un farol puede ser atractivo incluso sin un proyecto espectacular.\n\nLa equity funciona como respaldo cuando pagan: un proyecto a las nuts suele mejorar de forma más limpia que un proyecto dominado. Pero equity y fold equity no son intercambiables. Un proyecto puede realizar su equity mejor tomando check, especialmente si un raise nos obliga a abandonar o si estamos fuera de posición.\n\nEjemplo hipotético en river: hay 12 BB y apuestas 6 BB de farol puro. Sin equity al recibir call, necesitas que foldee más de 6/(12+6), es decir, un tercio, para que apostar sea rentable frente a rendirte. Este umbral no se traslada tal cual al flop: quedan cartas, apuestas y decisiones.\n\nEl plan también incluye parar. Si el rival paga flop y turn, su rango no es el mismo que antes de apostar. Un river que refuerza ese rango puede cerrar el farol. Haber invertido dos apuestas no es un argumento para invertir una tercera. La decisión se toma con la información y el coste actuales.",
    method: [
      "Identifica las manos mejores que quieres tirar y por qué podrían foldear frente a tu tamaño.",
      "Selecciona candidatos por equity, blockers relevantes y coste de renunciar al showdown. Compara con check.",
      "Define turns favorables, desfavorables y respuesta ante raise; actualiza el rango después de cada call.",
    ],
    limits:
      "El umbral de farol puro supone una única apuesta final, cero equity al recibir call y ausencia de rake. No prueba que el rival foldee esa frecuencia.",
    practice:
      "Encuentra tres faroles de varias calles. Antes de mirar el resultado, escribe el rango rival después de cada call. Señala la calle en la que tu objetivo dejó de ser creíble.",
    questions: [
      {
        prompt:
          "Bote de 12 BB y farol puro de 6 BB en river. ¿Qué fold equity supera el punto de equilibrio?",
        options: [
          "Más de un tercio.",
          "Más de dos tercios.",
          "Cualquier fold ocasional.",
        ],
        accepted: [0],
        explanation:
          "Arriesgas 6 para ganar 12: 6/(12+6)=1/3. Debe superar ese umbral para obtener beneficio bajo los supuestos indicados.",
      },
      {
        prompt:
          "Has apostado flop y turn; el river favorece el rango que pagó. ¿Qué justifica una tercera apuesta?",
        options: [
          "Que ya has invertido demasiado para parar.",
          "Un objetivo actual de folds suficiente, no las apuestas anteriores.",
          "Que tu mano no tenga showdown, sin más.",
        ],
        accepted: [1],
        explanation:
          "El dinero invertido ya no se recupera por insistir. La nueva apuesta exige una justificación nueva.",
      },
    ],
  },
  {
    slug: "leer-rangos",
    title: "Leer rangos calle a calle sin adivinar una mano exacta",
    area: "Laboratorio de manos",
    objective:
      "Actualizar familias de manos con cada acción, conservando alternativas razonables.",
    theory:
      "En la clase de hoy aprenderemos a pensar en familias de manos. Un rango inicial puede incluir parejas, ases suited, broadways y conectores. Cada acción cambia su peso, pero rara vez elimina automáticamente una familia completa. Un rival puede chequear top pair, pagar un proyecto o jugar lento una mano fuerte. Leer rangos consiste en justificar esos pesos, no en elegir una mano y buscar argumentos para ella.\n\nPrimero fija posiciones y acción preflop. Un call de BB frente a BTN no representa lo mismo que un call frente a UTG. Después separa valor fuerte, parejas medias, proyectos y aire en el flop. Cuando el rival paga una apuesta, pregunta qué manos continúan a ese tamaño. En el turn vuelve a clasificar: una carta puede mejorar proyectos, reducir valor relativo o abrir nuevos faroles.\n\nLos blockers cambian combinaciones disponibles. Tener un as reduce algunos Ax posibles, pero no elimina todos. Que bloquees una mano fuerte tampoco basta para farolear: debes desbloquear manos que foldeen o poder representar valor de forma coherente. El timing puede servir de observación, pero un call rápido aislado no identifica de forma fiable una mano.\n\nEl showdown sirve para revisar hipótesis. Si muestra una mano que habías descartado sin motivo, corrige tu procedimiento. Si muestra justo la que sospechabas, comprueba que tu análisis también incluía alternativas; acertar una vez no valida una lectura absoluta.",
    method: [
      "Construye un rango preflop por familias y anota los supuestos que lo sostienen.",
      "Después de cada acción, conserva valor, showdown y proyectos plausibles. Ajusta pesos sin convertir una tendencia en exclusión absoluta.",
      "Antes de decidir, compara tu mano con el rango que responde a tu acción, no solo con el rango que llegó a la calle.",
    ],
    limits:
      "Sin datos de apertura, defensa y respuesta no se presentan combinaciones o porcentajes como mediciones reales. Las hipótesis se contrastan fuera de sesión.",
    practice:
      "Pausa una revisión antes de cada decisión. Dibuja tres columnas: valor, showdown y proyectos/faroles. Repite tras el call y comprueba qué familias siguen siendo coherentes.",
    questions: [
      {
        prompt:
          "Un rival chequea flop. ¿Qué inferencia es más defendible sin más información?",
        options: [
          "Ya no puede tener top pair.",
          "Su rango conserva varias familias; el check cambia pesos, no elimina automáticamente todo el valor.",
          "Tiene exactamente un proyecto.",
        ],
        accepted: [1],
        explanation:
          "El check puede incluir trampas, control de bote, proyectos y manos débiles. Hace falta contexto para estrechar el rango.",
      },
      {
        prompt: "¿Para qué usarías un showdown inesperado?",
        options: [
          "Para corregir las exclusiones injustificadas del rango.",
          "Para concluir que el rival siempre juega así.",
          "Para ignorar toda la secuencia anterior.",
        ],
        accepted: [0],
        explanation:
          "Una mano aporta evidencia útil para revisar tu modelo, pero no establece por sí sola una frecuencia estable.",
      },
    ],
  },
  {
    slug: "estudiar-revisiones",
    title: "Cómo aprender de una revisión de manos de seis horas",
    area: "Laboratorio de manos",
    objective:
      "Transformar una sesión larga en conceptos, decisiones y ejercicios que puedas recuperar después.",
    theory:
      "En esta clase aprenderemos a estudiar una revisión larga sin limitarnos a escucharla. El objetivo no es completar seis horas: es salir con una decisión mejor explicada. Elige un problema antes de empezar, por ejemplo calls de river, apuestas sin valor o barrels en turns malos. Puedes dividir la sesión en bloques manejables y buscar manos relacionadas con esa pregunta.\n\nAntes de escuchar la respuesta, pausa. Registra posiciones, stack efectivo, bote, cartas y acciones que realmente ves. Escribe tu decisión y una alternativa. Después escucha al profesor y compara los motivos: ¿habla del perfil, de calls peores, de proyectos que fallan, de blockers o del tamaño? La conclusión útil debe poder explicarse sin recordar el resultado de esa mano.\n\nConvierte cada hallazgo en una regla condicional: «si el rival paga demasiado y encuentro suficientes calls peores, priorizo valor» es útil; «apostar siempre dos tercios» borra las condiciones. Añade una excepción y una pregunta que puedas responder mañana. Si la transcripción no aclara las cartas, conserva el concepto y vuelve al vídeo para verificar el ejemplo. No completes el board por intuición.\n\nAl terminar el bloque, selecciona una mano propia comparable y vuelve a decidir sin ayuda. Si solo puedes repetir la frase del profesor pero no identificar cuándo cambia, falta transferencia. Guarda una nota concreta y una tarea, no veinte conclusiones que no volverás a revisar.",
    method: [
      "Elige un concepto y trabaja un bloque de la sesión. Pausa antes de conocer la respuesta y escribe tu razonamiento.",
      "Compara motivos y condiciones. Conserva el enlace al momento original para recuperar el contexto.",
      "Resuelve una mano propia del mismo tipo y crea una pregunta de repaso. Separa lo aprendido de lo que aún necesitas comprobar.",
    ],
    limits:
      "Esta metodología no afirma haber analizado todas las sesiones del catálogo. La cobertura de transcripciones y las clases realmente disponibles se muestran en Revisiones de manos.",
    practice:
      "Haz un bloque de estudio: una mano pausada, una explicación, una excepción y una mano propia. Anota «cambiaré X cuando observe Y» y recupéralo en tu próximo repaso.",
    questions: [
      {
        prompt:
          "Después de una revisión recuerdas el resultado, pero no por qué se apostó. ¿Qué tarea mejora el aprendizaje?",
        options: [
          "Ver otra sesión entera sin pausar.",
          "Volver a la decisión, ocultar el resultado y explicar objetivo, rango y alternativa.",
          "Memorizar el tamaño exacto para todos los boards.",
        ],
        accepted: [1],
        explanation:
          "La recuperación activa y la comparación de alternativas convierten la observación en una decisión explicable.",
      },
      {
        prompt:
          "El subtítulo no permite identificar dos cartas. ¿Qué debes guardar?",
        options: [
          "Un board inventado que parezca probable.",
          "La jugada como receta universal.",
          "El concepto con sus condiciones y el enlace para verificar las cartas en el vídeo.",
        ],
        accepted: [2],
        explanation:
          "Un ejemplo incompleto puede enseñar un criterio, pero no debe presentarse como una mano reconstruida con precisión.",
      },
    ],
  },
];

export const workedExamples: Record<string, string> = {
  diagnostico:
    "Ganas con un call de river que justificaste solo con «no le creo». El resultado es favorable, pero el proceso sigue incompleto: no identificaste valor ni faroles. Repite el análisis ocultando las cartas del rival. Ahora pierdes con un set frente a un proyecto completado: la pérdida tampoco demuestra que apostar antes fuera un error. Evalúa con la información de cada calle, no con la última carta.",
  preflop:
    "CO abre y estás BTN con una broadway suited marginal. Tener posición ayuda, pero si las ciegas resuben con frecuencia, el precio inicial no es el coste completo del plan. Compara fold, call y 3-bet considerando dominación y rangos de continuación. Si el rival paga 3-bets demasiado amplio, el valor relativo de tus manos cambia. Si continúa muy fuerte, un blocker por sí solo no compensa todos los calls malos.",
  "srp-ip":
    "Abres BTN con AQ y BB paga. Compara A72 rainbow con 876 de dos palos. En el primero hay más parejas peores a las que podrías cobrar; en el segundo el rango de BB contiene más conexiones fuertes y raises incómodos. No necesitas apostar por haber sido el agresor. Con AQ sin proyecto en 876, tomar check conserva la posibilidad de mejorar sin inflar un bote frente a un rango conectado.",
  "srp-oop":
    "Defiendes BB y ligas pareja media. Chequear no significa renunciar a la mano: frente a una apuesta pequeña puedes tener una continuación, mientras que ante una secuencia grande cambia el rango que necesitas defender. Antes del check escribe cómo responderías a distintos tamaños. Evita apostar solo para no enfrentarte a una decisión: podrías tirar peores y recibir calls de mejores.",
  "3bet-ip":
    "Haces 3-bet en BTN y el rival paga fuera de posición. En un flop favorable, una apuesta pequeña puede tener sentido, pero no obliga a tres barrels. Con una pareja que gana al aire rival, un check puede conservar showdown; con un proyecto, evalúa qué turns mejoran tu equity y cuáles refuerzan al rival. La posición permite ver su acción antes de invertir de nuevo.",
  "3bet-oop":
    "Resubes desde SB y BTN paga. El bote ya es grande respecto al stack y jugarás primero. Una apuesta grande compromete más dinero y puede estrechar rápidamente los calls. Antes de elegirla, proyecta el bote del turn y el stack restante. Si no sabes qué hacer cuando pagan o resuben, el problema no se resuelve aumentando el tamaño.",
  turn: "Apuestas flop en A72 y el rival paga. Un turn 8 no cambia lo mismo que un turn que completa color. Actualiza primero sus parejas y proyectos; después decide. Haber apostado antes no convierte la segunda apuesta en obligatoria. Si tus calls peores desaparecen o tus folds objetivo mejoran, reducir agresión puede ser el ajuste coherente.",
  river:
    "Llegas con una pareja a un river donde falló un proyecto. Con check puedes ganar a aire. Si apuestas y solo pagan parejas mejores, no estás haciendo valor; para convertirla en farol necesitas que esas mejores foldeen con suficiente frecuencia. Antes de apostar escribe qué mejora respecto a tomar showdown. No tener la mejor mano siempre no significa que debas transformarla en bluff.",
  "thin-value":
    "Tienes top pair con kicker modesto. Si un rival paga con parejas inferiores, hay una hipótesis de valor fino. Si otro abandona esas parejas y solo paga top pairs mejores, la misma apuesta deja de tener esa función. Compara tamaños y respuesta ante raise; una lectura de call amplio no demuestra que sus resubidas sean débiles.",
  bluffcatch:
    "Bote de 10 BB y apuesta rival de 5 BB en river. Pagar cuesta 5 para disputar 20: necesitas ganar el 25% sin rake ni empates. Este número solo fija el precio. Todavía debes decidir si el rango rival contiene suficientes manos a las que ganas. Si apuestas de valor dominan su línea, que exista un proyecto fallido no resuelve esa comparación.",
  bluff:
    "Tienes un proyecto y consideras apostar. Anota qué parejas mejores foldearían ahora y qué ocurriría si pagan. Si el rival no abandona esas parejas, tu equity no crea fold equity. Un check puede realizar el proyecto con menos coste. Si apuestas, elige de antemano qué turns permiten continuar y cuáles cierran el plan.",
  bb: "Te ofrecen un precio pequeño en BB con una mano dominable y fuera de posición. Ese precio no asegura que realices toda tu equity: puedes foldear antes del river o pagar más cuando ligues una pareja peor. Compara defensa y fold incluyendo rake y rango de apertura. Estar invertido en la ciega no convierte el dinero que falta en una obligación.",
  recreacionales:
    "Observas calls demasiado amplios de un jugador en flops secos. Estudia apuestas de valor frente a ese rango, pero no extrapoles automáticamente a calls de river o raises. Describe la tendencia con el nodo y los ejemplos observados. Otro jugador recreacional puede abandonar mucho: la etiqueta común no exige la misma estrategia.",
  regulares:
    "Un regular foldea repetidamente a c-bets pequeñas en una familia de boards. La hipótesis es un exceso de fold en ese nodo, no que sea débil en todas las calles. Busca también las veces que continuó y evita seleccionar solo ejemplos favorables. Si cambia su defensa, tu ajuste debe cambiar con ella.",
  sizing:
    "Quieres cobrar a parejas débiles. Compara dos tamaños y pregunta cuántas de esas parejas pagarían cada uno. El mayor tamaño cobra más por call pero puede recibir menos calls. También importa el stack que dejas para la calle siguiente. Elegir un porcentaje fijo sin describir el rango que continúa oculta el problema que intentas resolver.",
  leaks:
    "Sospechas que haces demasiados segundos barrels. Selecciona apuestas y checks de turn comparables, ocultando el resultado. Clasifica textura, rival, objetivo y respuesta. Si solo revisas barrels perdidos, estás seleccionando por resultado. Diseña una tarea específica: justificar qué rango mejor foldea o qué rango peor paga antes de cada apuesta de estudio.",
  nl5: "Completar ejercicios no demuestra por sí solo que tu estrategia esté consolidada. Toma manos nuevas, explica las alternativas sin mirar notas y comprueba si mantienes el criterio en spots menos cómodos. Prioriza una dificultad repetida. La calidad de tus explicaciones y la transferencia a manos propias aportan información diferente a una racha de resultados.",
  nl10: "Antes de un cambio de nivel, construye una lista de situaciones que ya puedes resolver y otras que sigues adivinando: defensa BB, botes 3-beteados y river, por ejemplo. Define condiciones personales de exposición y de vuelta al nivel anterior. Haber visto un programa con un plazo llamativo no sustituye esta evaluación ni garantiza resultados.",
};
