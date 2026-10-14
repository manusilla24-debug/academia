/** Original editorial study material. It is NOT a transcription or a solver output. */
export interface StudyQuestion {
  prompt: string;
  options: string[];
  accepted: number[];
  explanation: string;
}
export interface StudyUnit {
  slug: string;
  title: string;
  area: string;
  objective: string;
  theory: string;
  method: string[];
  limits: string;
  practice: string;
  questions: StudyQuestion[];
}
export const cashCourse: StudyUnit[] = [
  {
    slug: "diagnostico",
    title: "Diagnóstico: separar una mala decisión de un mal resultado",
    area: "Diagnóstico y recuperación",
    objective:
      "Construir una hipótesis de mejora con evidencia y sin sesgo del resultado.",
    theory:
      "Una mano perdida no demuestra un error y una mano ganada no valida el plan. Revisa primero la información disponible en el momento de decidir: posiciones, stacks, tamaños, rangos y lectura del rival. Después pregunta qué quería conseguir cada apuesta. Recuperar criterio consiste en explicar por qué una línea es razonable y qué dato la haría cambiar, no en memorizar la carta que acabó ganando.",
    method: [
      "Oculta el resultado y reconstruye la línea antes de analizarla. Separa hechos observados, supuestos e información ausente.",
      "Escribe una alternativa razonable y compara qué rango rival continúa frente a cada línea. Una explicación que solo funciona con la mano real del rival está incompleta.",
      "Agrupa errores parecidos y contrástalos en varias manos. Selecciona una sola tarea de revisión para la próxima sesión de estudio.",
    ],
    limits:
      "Una muestra pequeña puede revelar una duda útil, pero no permite atribuir frecuencias estables ni un leak estadísticamente demostrado. No conviertas una hipótesis de población en una certeza sobre una persona.",
    practice:
      "Selecciona cinco manos sin mirar el resultado. Escribe objetivo, rango rival y alternativa. Solo después descubre el showdown y decide si realmente cambia tu evaluación.",
    questions: [
      {
        prompt:
          "Has ganado un bote grande después de pagar river sin identificar faroles plausibles. ¿Qué evaluación corresponde?",
        options: [
          "La victoria demuestra que el call era correcto.",
          "El resultado no valida la decisión: reconstruir el rango que apuesta y los supuestos del call.",
          "El call fue necesariamente malo por no haber escrito el rango.",
        ],
        accepted: [1],
        explanation:
          "El razonamiento estaba incompleto; la rentabilidad del call requiere contexto. Ni victoria ni ausencia de notas permiten concluir por sí solas que era correcto o incorrecto.",
      },
      {
        prompt:
          "Fallas dos ejercicios de turn. ¿Qué puedes registrar de forma defendible?",
        options: [
          "Un leak estadístico demostrado de overbarreling.",
          "Una hipótesis de dificultad en turn y una tarea de repaso.",
          "Que nunca debes hacer second barrel hasta subir de nivel.",
        ],
        accepted: [1],
        explanation:
          "Los intentos son evidencia real de aprendizaje, pero dos fallos no estiman tu estrategia en todas las manos.",
      },
    ],
  },
  {
    slug: "preflop",
    title: "Preflop: abrir, pagar y 3-bet con un plan posterior",
    area: "Optimización preflop",
    objective:
      "Distinguir selección de manos, rival objetivo y consecuencias postflop.",
    theory:
      "Una tabla preflop sirve como punto de partida bajo condiciones concretas. El tamaño de open, rake, posiciones, stacks y jugadores por hablar cambian el valor de pagar o resubir. El cold-call de una mano aparentemente bonita puede acabar dominado, fuera de posición o frente a un squeeze. Una 3-bet tampoco se justifica solo por tener un blocker: importa el rango que continúa y cómo jugarás el bote resultante.",
    method: [
      "Antes de pagar, comprueba quién queda por actuar, posibilidad de squeeze, dominación y posición. No trates el dinero ya invertido como argumento.",
      "Distingue 3-bet por valor contra calls peores de una resubida orientada a folds. Una mano puede cambiar de función según el rival.",
      "Relaciona el tamaño con stacks y posición; revisa cómo cambia el SPR y qué rango de continuación esperas.",
    ],
    limits:
      "No se incluye una tabla universal ni se asigna rentabilidad a combos sin rangos y rake. Los ajustes explotativos requieren una lectura concreta; «en NL5 todos hacen lo mismo» no es una lectura suficiente.",
    practice:
      "Revisa diez decisiones de cold-call. Clasifica qué ventaja esperabas conservar y qué podía pasar si un jugador de detrás resubía.",
    questions: [
      {
        prompt:
          "CO abre; estás BTN con una mano marginal que puede estar dominada y las ciegas hacen squeeze a menudo. ¿Qué debes incluir antes de pagar?",
        options: [
          "Solo el precio inmediato y que tienes posición sobre CO.",
          "La probabilidad de squeeze, dominación y realización de equity, además del precio.",
          "Que cualquier mano suited justifica el call en posición.",
        ],
        accepted: [1],
        explanation:
          "La posición ayuda, pero no elimina la amenaza de jugadores por detrás ni la dominación al completar una pareja.",
      },
      {
        prompt:
          "Un rival continúa a tus 3-bets con muchas manos peores y foldea poco. ¿Qué adaptación estudiarías?",
        options: [
          "Priorizar una composición de valor más amplia y reducir faroles débiles.",
          "Incrementar faroles solo porque tienen un as.",
          "Mantener cualquier tamaño y rango aunque cambie su respuesta.",
        ],
        accepted: [0],
        explanation:
          "Si los calls peores aumentan, cambia la función de la resubida. El ajuste exacto depende de sus rangos, stacks y posiciones.",
      },
    ],
  },
  {
    slug: "srp-ip",
    title: "SRP en posición: textura, rango de check y c-bet",
    area: "Single-raised pots IP",
    objective:
      "Elegir apuestas que tengan un objetivo y proteger las líneas de check.",
    theory:
      "Como agresor en posición puedes apostar o aprovechar la posibilidad de ver otra carta. La ventaja preflop no implica ventaja idéntica en todos los boards. Un flop bajo y conectado puede conectar bien con la defensa de BB. El check conserva equity y showdown de manos que no obtienen suficiente valor o folds al apostar; también necesita manos capaces de continuar después para no ser una renuncia automática.",
    method: [
      "Describe qué parte de ambos rangos conecta con la textura, además de contar overcards o parejas.",
      "Para cada apuesta identifica calls peores, folds mejores o equity que consigues negar. Si no puedes explicar ninguno, compara con check.",
      "Planifica qué ocurre ante check-raise y qué turns favorecen seguir apostando o tomar una carta gratis.",
    ],
    limits:
      "Sin rangos concretos no se define una frecuencia de c-bet ni un tamaño único. El número de jugadores y el perfil rival pueden cambiar sustancialmente la estrategia.",
    practice:
      "Compara BTN vs BB en A72 rainbow y 876 con dos cartas del mismo palo. Explica qué cambia sin atribuir una frecuencia exacta a ninguno.",
    questions: [
      {
        prompt:
          "BTN abre, BB paga; ambos 100 BB iniciales. Flop 8h 7h 6c, bote 5,5 BB, BB check. Hero Ac Qd. Sin reads fiables, ¿qué plan es defendible?",
        options: [
          "Considerar check, estudiar el rango conectado de BB y preservar equity.",
          "Apostar grande necesariamente porque Hero abrió preflop.",
          "Planear tres barrels con cualquier turn.",
        ],
        accepted: [0],
        explanation:
          "Check es una heurística defendible con esta combinación. No se afirma que sea la única solución ni que la textura determine por sí sola todas las decisiones.",
      },
      {
        prompt:
          "Tu rango de check flop solo contiene manos que foldean ante cualquier apuesta en turn. ¿Qué problema estudiarías?",
        options: [
          "Que check debe eliminarse del juego en posición.",
          "Que el rango puede estar desprotegido y conviene revisar qué manos con capacidad de continuar hacen check.",
          "Que necesitas apostar todas las manos fuertes en todos los flops.",
        ],
        accepted: [1],
        explanation:
          "La respuesta es revisar la composición del check, no imponer una frecuencia universal de bet.",
      },
    ],
  },
  {
    slug: "srp-oop",
    title: "SRP fuera de posición: sostener una línea de check",
    area: "Single-raised pots OOP",
    objective:
      "Responder al rango y al tamaño sin confundir check con debilidad.",
    theory:
      "Fuera de posición no controlas si habrá una apuesta tras tu check. Necesitas pensar qué manos pueden pagar, cuáles pueden hacer check-raise y cuáles abandonan. La misma pareja puede cumplir funciones distintas según textura y rango rival. Pagar flop por tener algo y decidir después sin plan puede acumular calls costosos cuando la línea rival se polariza.",
    method: [
      "Antes del check identifica respuestas posibles frente a tamaños pequeños y grandes. No decidas solo por la fuerza absoluta de tu mano.",
      "Revisa cómo conserva el rival sus faroles y su valor tras cada calle. Un rango de apuesta pequeño puede diferir del que overbetea.",
      "Usa check-raise con una función clara y un plan si te pagan. «Proteger» no basta si solo continúan manos mejores.",
    ],
    limits:
      "No hay obligación de defender un porcentaje fijo contra un rival que no usa una estrategia de equilibrio. Tampoco es válido foldear automáticamente porque juegas OOP.",
    practice:
      "Anota tres manos en las que pagaste flop OOP. Escribe antes de ver turn qué cartas y tamaños cambiarían tu respuesta.",
    questions: [
      {
        prompt:
          "BB paga flop con pareja media. El turn cambia mucho la textura y BTN aumenta notablemente el tamaño. ¿Qué análisis corresponde?",
        options: [
          "Pagar porque pagar flop obliga a continuar.",
          "Reestimar rango, tamaño y runout; el call de flop no obliga al de turn.",
          "Foldear siempre cualquier pareja media.",
        ],
        accepted: [1],
        explanation:
          "Cada decisión utiliza la información nueva. No existe una obligación de completar una línea por inversión previa.",
      },
      {
        prompt:
          "Propones check-raise «para saber dónde estás», pero crees que solo te pagan manos mejores. ¿Qué debes revisar?",
        options: [
          "Si existe suficiente valor, equity o fold equity para justificarlo frente a call o fold.",
          "Solo si el raise transmite fuerza visual.",
          "Que todos los raises deben acabar all-in.",
        ],
        accepted: [0],
        explanation:
          "Comprar información no es una justificación suficiente para aislarte contra un rango que te domina.",
      },
    ],
  },
  {
    slug: "3bet-ip",
    title: "3-bet pots IP: aprovechar posición sin regalar el plan",
    area: "Botes 3-beteados IP",
    objective:
      "Relacionar SPR, rangos y evolución de apuestas en un bote resubido.",
    theory:
      "Un bote 3-beteado concentra rangos y reduce el SPR respecto a un single-raised pot. Eso no obliga a comprometer automáticamente todo el stack con una pareja. En posición puedes aprovechar checks para conservar showdown, controlar el crecimiento del bote o seleccionar faroles. La composición preflop y la textura importan más que el nombre «3-bet pot».",
    method: [
      "Reconstruye quién 3-beteó y quién pagó; no intercambies sus rangos por comodidad.",
      "Distingue una mano con showdown que puede hacer check de una candidata a bluff. Convertir showdown en farol exige identificar folds mejores.",
      "Si apuestas flop, enumera turns de continuación, turns de abandono y respuestas a check-raise antes de decidir tamaño.",
    ],
    limits:
      "Las líneas de un ejemplo no son recetas universales. Tamaños pequeños, overbets o stacks comprometidos requieren contexto y una revisión precisa del SPR.",
    practice:
      "Busca cinco botes 3-beteados IP y clasifica por qué apostaste: valor, bluff, denial o ausencia de un objetivo explicable.",
    questions: [
      {
        prompt:
          "En un bote 3-beteado IP tienes showdown modesto y la opción de check. ¿Qué planes pueden ser razonables según rangos y runout?",
        options: [
          "Preservar showdown mediante check.",
          "Convertir la mano en farol si identificas folds mejores y un plan coherente.",
          "Apostar obligatoriamente porque el bote es 3-beteado.",
        ],
        accepted: [0, 1],
        explanation:
          "Check y bluff pueden ser alternativas bajo supuestos distintos. La etiqueta del bote no decide entre ellas.",
      },
      {
        prompt:
          "Quieres apostar flop y varios turns como farol, pero no sabes en qué rivers seguir. ¿Qué falta?",
        options: [
          "Una promesa de que el rival foldeará.",
          "Definir cartas, rangos de continuación y condiciones de abandono o tercer barrel.",
          "Conocer el resultado que tendrá el river.",
        ],
        accepted: [1],
        explanation:
          "Planificar no significa adivinar la carta; significa identificar cómo actualizarás la decisión.",
      },
    ],
  },
  {
    slug: "3bet-oop",
    title: "3-bet pots OOP: controlar exposición y rangos de continuación",
    area: "Botes 3-beteados OOP",
    objective:
      "Evitar comprometer stacks por inercia con manos de valor medio.",
    theory:
      "Al 3-betear OOP renuncias a la ventaja de actuar después. La apuesta de flop debe convivir con rangos de check que puedan continuar. Un sizing que deja un SPR pequeño en turn puede transformar una decisión aparentemente modesta en un compromiso grande. Conviene decidir qué manos dominadas reciben valor y qué parte del rango rival permanece después de cada call.",
    method: [
      "Calcula bote y stacks restantes antes de elegir un tamaño, sin asumir que una 3-bet equivale a stack-off.",
      "No sobrevalores top pair cuando la acción rival filtra su rango hacia valor fuerte. Tampoco reduzcas todo check a check-fold.",
      "Compara líneas de bet y check observando qué faroles rivales conservas y de qué manos peores obtienes calls.",
    ],
    limits:
      "No se propone una defensa universal contra raises ni una lista de stacks-off. Efectivo, posiciones, rake y rangos son indispensables para concretar.",
    practice:
      "Reconstruye el bote de una mano calle a calle y explica cuándo tu tamaño comprometió una proporción importante del stack.",
    questions: [
      {
        prompt:
          "3-beteas SB, BTN paga; tras bet flop y call la textura de turn favorece parte de su rango. ¿Qué evita decidir en piloto automático?",
        options: [
          "Recordar que todo top pair debe jugar por cajas.",
          "Revisar SPR, valor que continúa y rangos de check antes de elegir otro bet.",
          "Hacer check-fold con todas las manos OOP.",
        ],
        accepted: [1],
        explanation:
          "El SPR importa junto con los rangos, no como una obligación aislada de comprometerse.",
      },
      {
        prompt:
          "Tu apuesta grande recibe calls casi solo de mejores manos y hace foldear manos peores con poco equity. ¿Qué alternativa merece estudio?",
        options: [
          "Un tamaño menor o una línea de check, según rangos.",
          "Aumentar aún más siempre.",
          "Repetirla porque preflop tenías una premium.",
        ],
        accepted: [0],
        explanation:
          "Es necesario comparar qué consigue realmente cada tamaño y si existe valor frente al rango que paga.",
      },
    ],
  },
  {
    slug: "turn",
    title: "Turn: decidir qué cambia antes del second barrel",
    area: "Juego en turn",
    objective: "Actualizar valor, equity y fold equity con la carta nueva.",
    theory:
      "El turn no es una repetición del flop con un bote mayor. La carta puede completar proyectos, modificar ventajas de nuts o mejorar el rango que pagó. Un segundo barrel necesita un objetivo actualizado. Tener equity ayuda a algunos faroles, pero no garantiza beneficio frente a cualquier rival o tamaño.",
    method: [
      "Pregunta qué manos nuevas forman valor y qué proyectos dejan de ser limpios. Distingue outs visibles de outs que realmente ganan.",
      "Para un bluff enumera folds plausibles y qué ocurrirá si te pagan. Para valor identifica manos peores concretas que sigan.",
      "Con manos medias de showdown estudia si el check evita aislarte frente a un rango superior.",
    ],
    limits:
      "Una overcard no es automáticamente una scare card para el rival. Sin rangos no se prescribe qué combos deben barrelear ni su frecuencia.",
    practice:
      "Toma una textura de flop y compara un blank, una overcard y una carta que complete color. Escribe cómo cambia el rango rival tras pagar flop.",
    questions: [
      {
        prompt:
          "Apuestas flop con un proyecto; turn no completa. ¿Qué información justifica estudiar otro barrel?",
        options: [
          "Equity al ser pagado, cambios de rangos, blockers, fold equity y tamaño.",
          "Que llevas dos manos sin ganar.",
          "Que apostar flop obliga a apostar turn.",
        ],
        accepted: [0],
        explanation:
          "El barrel debe responder a un objetivo y a la información nueva, con un plan para el river.",
      },
      {
        prompt:
          "El turn completa el proyecto más visible del rival. Tu mano aún tiene showdown. ¿Qué análisis es defendible?",
        options: [
          "Apostar por protección sin pensar qué manos pagan.",
          "Comparar check con apostar contra su rango actualizado, sin convertir automáticamente showdown en bluff.",
          "Abandonar siempre porque el color es posible.",
        ],
        accepted: [1],
        explanation:
          "Posibilidad de una mano fuerte no equivale a certeza, pero sí cambia la composición del rango y el valor de apostar.",
      },
    ],
  },
  {
    slug: "river",
    title: "River: valor, farol o showdown",
    area: "Juego en river",
    objective: "Asignar una función concreta a la decisión final.",
    theory:
      "En river ya no se puede negar equity de cartas futuras. Una apuesta debe justificarse por valor frente a calls peores o como farol frente a folds mejores. «Proteger mi mano» deja de ser una explicación válida. Una mano puede tener showdown suficiente para check aunque no encuentre una apuesta rentable.",
    method: [
      "Lista manos peores que pagarían y mejores que foldearían; evita construir el análisis solo con la mano real del rival.",
      "Observa cómo la secuencia de acciones eliminó o conservó proyectos fallidos y valor. La línea completa importa más que una carta aislada.",
      "Si esperas un raise, decide previamente qué parte parece valor, qué faroles son plausibles y si tu apuesta inicial sigue teniendo sentido.",
    ],
    limits:
      "No existe un bluffcatch obligatorio contra cualquier tamaño ni un bet obligatorio con cualquier top pair. La composición del rival puede justificar ajustes grandes.",
    practice:
      "Revisa cinco apuestas de river y escribe si eran valor o farol. Si ninguna categoría encaja, analiza si check era más coherente.",
    questions: [
      {
        prompt:
          "En river apuestas una pareja media «para proteger». Solo te pagan mejores y peores foldean. ¿Qué problema hay?",
        options: [
          "La protección contra cartas futuras ya no existe y falta un objetivo rentable de valor o bluff.",
          "Toda pareja media debe apostar grande.",
          "El tamaño solo es malo si pierdes al showdown.",
        ],
        accepted: [0],
        explanation:
          "En river evalúas la apuesta frente a calls y folds del rango actual, no cartas que ya no van a caer.",
      },
      {
        prompt:
          "Tu mano gana a suficientes checks del rival, pero sus calls serían mucho más fuertes. ¿Qué línea puede ser razonable?",
        options: [
          "Check y realizar showdown.",
          "Convertirla siempre en bluff grande.",
          "Apostar siempre para evitar enseñar cartas.",
        ],
        accepted: [0],
        explanation:
          "No necesitar una apuesta no implica que tu mano carezca de valor de showdown.",
      },
    ],
  },
  {
    slug: "thin-value",
    title: "Thin value: cobrar sin confundir esperanza con calls",
    area: "Valor y thin value",
    objective: "Encontrar calls de manos peores y anticipar respuestas.",
    theory:
      "Thin value significa que la ventaja frente al rango que paga es ajustada, no que cualquier apuesta pequeña sea buena. Debes identificar suficientes manos peores que continúan. Un rival que llega al river con muchas parejas débiles y paga puede ofrecer valor donde otro solo paga fuerte. El tamaño modifica la composición de ese rango.",
    method: [
      "Escribe manos peores concretas y por qué llegarían a esta línea. No basta con decir «hay muchas manos».",
      "Compara tamaños por la respuesta que inducen. Una apuesta grande puede expulsar justo a las manos de las que querías cobrar.",
      "Planifica contra raise sin convertir bet-fold en una certeza universal. La tendencia del rival y tus blockers cambian la evaluación.",
    ],
    limits:
      "El valor esperado exacto necesita probabilidades y pagos, no una etiqueta de rival. Un call peor observado una vez no demuestra que cualquier tamaño reciba calls peores.",
    practice:
      "Busca tres checks de river con showdown fuerte. Estudia si había calls peores y qué tamaño podía conservarlos.",
    questions: [
      {
        prompt:
          "Tienes top pair y crees que un tamaño grande hace foldear las parejas inferiores que pagarían pequeño. ¿Qué comparación es útil?",
        options: [
          "Qué rango paga cada tamaño y cuánto valor obtiene la apuesta frente a check.",
          "Elegir grande siempre para maximizar lo cobrado por call.",
          "Elegir pequeño siempre por llamarlo thin value.",
        ],
        accepted: [0],
        explanation:
          "Ambos tamaños cambian el número y la fuerza de los calls; el importe aislado no resuelve la decisión.",
      },
      {
        prompt:
          "Has apostado thin value y un rival pasivo hace un raise grande. ¿Qué debes reconsiderar?",
        options: [
          "La composición de su raise; tu apuesta de valor no te obliga a pagar.",
          "Que apostar te comprometió emocionalmente con la mano.",
          "Que pasivo significa incapaz de farolear en cualquier contexto.",
        ],
        accepted: [0],
        explanation:
          "La nueva acción puede seleccionar un rango mucho más fuerte. La lectura pasiva es una hipótesis, no una prohibición matemática de faroles.",
      },
    ],
  },
  {
    slug: "bluffcatch",
    title: "Bluffcatching: pagar a una composición, no a una sospecha",
    area: "Bluffcatching",
    objective: "Comparar valor y faroles sin inventar estadísticas.",
    theory:
      "Un bluffcatcher gana principalmente a faroles. La decisión depende de cuántas combinaciones de valor y bluff conserva la línea rival, del tamaño y de cómo tu mano bloquea esas combinaciones. La fuerza absoluta de la pareja y estar cerca del top de tu rango no sustituyen esa evaluación.",
    method: [
      "Recorre la línea desde preflop y conserva solo faroles plausibles. No añadas todos los proyectos fallidos si no habrían tomado esta acción.",
      "Estudia blockers de valor y de faroles por separado. Bloquear proyectos fallidos puede perjudicar un call.",
      "Compara el precio con el rango que apuesta y declara incertidumbre cuando faltan datos. Una lectura de población debe poder corregirse.",
    ],
    limits:
      "Sin conteos y probabilidades válidos no se publica una frecuencia GTO, equity ni EV exacta. Tampoco puede deducirse una estrategia de todos los jugadores de NL2 a partir de una mano.",
    practice:
      "Oculta el showdown de un river difícil. Lista valor y bluff, revisa tus blockers y anota qué lectura cambiaría call por fold.",
    questions: [
      {
        prompt:
          "Tu bluffcatcher contiene una carta del proyecto de color fallido. ¿Qué efecto puede tener?",
        options: [
          "Puede bloquear faroles del rival y empeorar el call según sus rangos.",
          "Siempre mejora el call por ser un blocker.",
          "Demuestra que el rival lleva valor.",
        ],
        accepted: [0],
        explanation:
          "Un blocker no es bueno en abstracto: importa qué combinaciones retira y a cuáles ganas.",
      },
      {
        prompt:
          "Pagas «porque no puedo foldear todo mi rango», pero crees con evidencia suficiente que este rival apenas farolea esta línea. ¿Qué debes contrastar?",
        options: [
          "La obligación teórica asumida frente a la composición real del rival y el tamaño.",
          "Solo la fuerza absoluta de tu pareja.",
          "Que cualquier ajuste explotativo es incorrecto.",
        ],
        accepted: [0],
        explanation:
          "Las defensas de equilibrio no obligan a pagar a un rango observado que se desvía; la calidad de la evidencia sigue siendo esencial.",
      },
    ],
  },
  {
    slug: "bluff",
    title: "Seleccionar faroles: equity, blockers y folds plausibles",
    area: "Bluffing",
    objective:
      "Distinguir una oportunidad de farol de una apuesta sin objetivo.",
    theory:
      "Un bluff debe provocar suficientes folds mejores para compensar su coste y el resultado cuando es pagado. Antes del river, la equity al ser pagado puede mejorar una candidata. Los blockers ayudan si retiran calls o raises relevantes y conservan folds, pero no convierten una mano en rentable por sí solos.",
    method: [
      "Identifica qué parte del rango rival esperas que foldee y por qué tu línea representa valor creíble.",
      "Con proyectos, diferencia outs limpios de cartas que completan una mano aún dominada. No atribuyas equity exacta sin cálculo válido.",
      "Planifica cartas de continuación y de abandono. Que un farol haya fallado dos veces no decide su rentabilidad; revisa el proceso y la muestra.",
    ],
    limits:
      "Ventaja de rango o mucha equity no significan «apostar siempre». Posición, número de rivales, tamaños y tendencias pueden exigir estrategias distintas.",
    practice:
      "Compara dos candidatos de bluff en un mismo board: uno con equity y otro sin ella. Explica qué folds y runouts necesita cada uno.",
    questions: [
      {
        prompt:
          "El rival paga demasiado y tu mano tiene poca equity al ser pagada. ¿Qué adaptación merece estudio?",
        options: [
          "Reducir ese tipo de faroles y priorizar valor, verificando la lectura.",
          "Aumentar el tamaño de todos los faroles sin revisar rangos.",
          "Farolear porque la mano no tiene showdown.",
        ],
        accepted: [0],
        explanation:
          "Carecer de showdown no basta: la apuesta necesita folds o recuperación suficiente cuando se enfrenta a calls.",
      },
      {
        prompt:
          "Un farol falló tres veces. ¿Qué permite decidir si seguir usándolo?",
        options: [
          "Solo contar esas tres derrotas.",
          "Revisar selección de rival, equivalencia del spot, rangos y tamaño, reconociendo la varianza.",
          "Repetirlo siempre porque alguien lo llamó obligatorio.",
        ],
        accepted: [1],
        explanation:
          "Ni una secuencia corta de resultados ni una etiqueta sustituyen la evaluación contextual.",
      },
    ],
  },
  {
    slug: "bb",
    title: "Defender BB: precio, rake y realización de equity",
    area: "Defensa de ciegas",
    objective:
      "Evitar defender por descuento sin estudiar dominación y contexto.",
    theory:
      "La BB tiene un precio distinto porque ya ha invertido una ciega, pero ese importe es un coste hundido. La decisión nueva compara fold, call o 3-bet con el rango de open, tamaño, posición y rake. Una mano puede tener equity bruta y realizar poca por dominación y desventaja posicional.",
    method: [
      "Compara tamaños de open y posición del agresor: BTN pequeño y UTG grande no ofrecen el mismo problema.",
      "Evalúa dominación de parejas, jugabilidad y posibilidad de realizar equity sin pagar varias calles con manos débiles.",
      "Relaciona tus 3-bets con el rango de continuación y tu plan OOP, no solo con querer recuperar la ciega.",
    ],
    limits:
      "No se incluye una tabla única de defensa ni una frecuencia mínima válida para todas las salas. El rake y los rangos alteran especialmente calls marginales.",
    practice:
      "Selecciona diez defensas de BB y agrúpalas por posición y tamaño de open. Busca los calls más dependientes de supuestos optimistas.",
    questions: [
      {
        prompt:
          "UTG abre grande y tienes una mano offsuit fácilmente dominada en BB. ¿Qué argumento no basta para pagar?",
        options: [
          "Que ya has puesto una ciega y tienes descuento.",
          "Considerar su rango y el rake.",
          "Valorar dominación y realización de equity.",
        ],
        accepted: [0],
        explanation:
          "La ciega ya invertida no se recupera automáticamente pagando. La decisión nueva necesita suficiente valor frente al coste adicional.",
      },
      {
        prompt:
          "¿Por qué no debes copiar sin más tu defensa frente a BTN pequeño contra un open mayor de UTG?",
        options: [
          "Porque cambian rango, precio y realización de equity.",
          "Porque BB siempre debe defender menos de una cifra fija.",
          "Porque UTG nunca puede tener un farol postflop.",
        ],
        accepted: [0],
        explanation:
          "La estructura del spot es diferente; no hacen falta frecuencias inventadas para reconocerlo.",
      },
    ],
  },
  {
    slug: "recreacionales",
    title: "Contra recreacionales: explotar una tendencia concreta",
    area: "Juego contra recreacionales",
    objective:
      "Sustituir etiquetas amplias por observaciones que cambien decisiones.",
    theory:
      "«Recreacional» reúne perfiles muy distintos. Uno puede pagar demasiado preflop y foldear demasiado en turn; otro puede jugar pasivo con proyectos y resubir casi solo valor. Tu ajuste debe responder al comportamiento concreto, no a la etiqueta. Una lectura útil incluye evidencia, contexto e incertidumbre.",
    method: [
      "Describe la tendencia en una situación: tamaño, calle y tipo de bote. Diferencia calls amplios de raises fuertes.",
      "Si hay calls peores, estudia ampliar valor; si hay folds excesivos en un nodo concreto, estudia faroles apropiados.",
      "Mantén un plan ante acciones que contradicen la lectura y actualiza la hipótesis cuando aparezca nueva evidencia.",
    ],
    limits:
      "Un showdown memorable no permite asignar una estadística exacta. No se asume que perfiles recreacionales carezcan de faroles o que paguen cualquier importe.",
    practice:
      "Reescribe tres notas vagas del rival como observaciones: qué ocurrió, en qué contexto y qué hipótesis de ajuste sugiere.",
    questions: [
      {
        prompt:
          "Un rival paga demasiado apuestas pequeñas pero no has visto cómo responde a overbets. ¿Qué afirmación es defendible?",
        options: [
          "Pagará cualquier tamaño con cualquier pareja.",
          "La lectura se refiere a los tamaños observados; extrapolarla a overbets añade incertidumbre.",
          "Debes dejar de apostar valor.",
        ],
        accepted: [1],
        explanation:
          "La adaptación debe apoyarse en el nodo y tamaño para los que existe evidencia.",
      },
      {
        prompt: "Tu nota dice «fish». ¿Qué información la haría más útil?",
        options: [
          "Una situación observada y una hipótesis de ajuste con incertidumbre.",
          "Un insulto más específico.",
          "Asignarle un VPIP exacto sin muestra.",
        ],
        accepted: [0],
        explanation:
          "Una nota útil cambia decisiones concretas y distingue datos de suposiciones.",
      },
    ],
  },
  {
    slug: "regulares",
    title: "Contra regulares: detectar el nodo, no inventar una guerra",
    area: "Ajustes explotativos",
    objective: "Buscar desviaciones específicas sin abandonar disciplina.",
    theory:
      "Un regular no usa necesariamente una estrategia de equilibrio ni responde a todos los tamaños igual. Los ajustes se formulan por nodos: defensa a 3-bet por posición, fold ante barrels en ciertos runouts o composición de raises. La familiaridad con el rival no autoriza a inventar una dinámica de faroles.",
    method: [
      "Parte de una línea razonable y pregunta qué dato justifica desviarte. Conserva la incertidumbre cuando la muestra es pequeña.",
      "Distingue oportunidad clara de una reacción emocional a haber perdido varios botes.",
      "Revisa si el ajuste expone otras partes de tu rango o si el rival puede adaptar su respuesta.",
    ],
    limits:
      "No se pueden derivar frecuencias óptimas de estadísticas agregadas sin sus filtros y muestra. No existe obligación de equilibrar cada microspot contra cualquier rival.",
    practice:
      "Elige un regular y redacta una sola hipótesis explotativa verificable. Define qué manos la apoyarían y cuáles la refutarían.",
    questions: [
      {
        prompt:
          "Has perdido tres botes seguidos contra un regular y quieres ampliar mucho tus 4-bets de farol. ¿Qué falta para justificarlo?",
        options: [
          "Evidencia sobre su 3-bet y continuación a 4-bet en esas posiciones.",
          "Haber perdido un cuarto bote.",
          "Que conozca tu nombre de usuario.",
        ],
        accepted: [0],
        explanation:
          "La secuencia emocional de resultados no describe los rangos necesarios para ese ajuste.",
      },
      {
        prompt:
          "Una estadística global parece alta pero mezcla posiciones y formatos. ¿Qué hacer antes de explotarla?",
        options: [
          "Revisar filtros, número de oportunidades y contexto.",
          "Tratarla como frecuencia exacta del spot actual.",
          "Ignorar cualquier dato estadístico para siempre.",
        ],
        accepted: [0],
        explanation:
          "Las oportunidades relevantes y la selección de muestra determinan qué inferencia permite el dato.",
      },
    ],
  },
  {
    slug: "sizing",
    title: "Sizing: qué rango quieres que continúe",
    area: "Bet sizing y rangos",
    objective: "Elegir tamaños por la respuesta esperada y el plan de stack.",
    theory:
      "El sizing cambia el precio, la fuerza del rango que continúa y la geometría de apuestas de calles posteriores. Grande no equivale automáticamente a protección y pequeño no equivale a debilidad. Un tamaño puede conseguir más calls peores o, al contrario, aislar contra mejores. Primero define el objetivo y después compara tamaños.",
    method: [
      "Anota bote, stacks efectivos y cantidad añadida. Evita confundir raise a con raise por.",
      "Compara cómo responde el rango rival a pequeño, medio y grande, sin inventar porcentajes cuando no hay datos.",
      "Mira el bote y el stack que quedarían después de un call. Comprueba si la siguiente calle exige un plan que no querías asumir.",
    ],
    limits:
      "Los sizings exactos de una fuente requieren el spot completo y revisión de su transcripción. No deben copiarse de una mano cuyos stacks o board no se conocen.",
    practice:
      "Reconstruye una mano en BB y calcula el bote después de cada aportación. Propón otro tamaño y explica cómo cambiaría tu plan.",
    questions: [
      {
        prompt:
          "Quieres apostar valor, pero un tamaño grande elimina manos peores y conserva principalmente mejores. ¿Qué debes contrastar?",
        options: [
          "Si un tamaño menor o check mejora la función de tu mano frente a ese rango.",
          "Solo cuánto impresiona la apuesta.",
          "Que apostar pot siempre maximiza valor.",
        ],
        accepted: [0],
        explanation:
          "El tamaño debe estudiarse junto con quién paga y qué ocurre después.",
      },
      {
        prompt:
          "En el editor una acción indica «raise 8 BB añadidas». ¿Qué representa?",
        options: [
          "Ocho BB nuevas que ese jugador aporta al bote en esa acción.",
          "Que el bote final pasa automáticamente a ocho BB.",
          "Que todas sus aportaciones de la calle suman ocho BB sin más datos.",
        ],
        accepted: [0],
        explanation:
          "La convención de aportaciones evita mezclar raise-to y raise-by; el bote se valida con esa interpretación.",
      },
    ],
  },
  {
    slug: "leaks",
    title: "Leaks: de una sospecha a un experimento de revisión",
    area: "Análisis de leaks",
    objective:
      "Organizar evidencia que permita confirmar o descartar patrones.",
    theory:
      "Un leak es una tendencia costosa, no cualquier mano que te incomoda. Para investigarlo necesitas definir el nodo, reunir ejemplos comparables y observar qué decisiones se repiten. Las estadísticas pueden orientar la búsqueda, pero no explican solas qué manos fueron mal jugadas ni controlan todos los factores del contexto.",
    method: [
      "Formula la hipótesis con precisión: «segundo barrel sin objetivo contra calls fuertes», en lugar de «juego mal turn».",
      "Asocia manos o intentos, separa casos que sí encajan y documenta las excepciones.",
      "Después del repaso define una señal observable y vuelve a revisar. Marcar trabajado no significa demostrado ni corregido definitivamente.",
    ],
    limits:
      "Las muestras pequeñas, selección por botes perdidos y conocimiento del resultado pueden sesgar la revisión. Los ejercicios miden comprensión del material, no tu winrate real.",
    practice:
      "Crea una hipótesis y vincula tres manos comparables. Escribe qué caso te haría retirarla y qué contenido debes repasar.",
    questions: [
      {
        prompt:
          "Filtras solo los mayores botes perdidos y concluyes que todos tus calls de river son malos. ¿Qué sesgo debes considerar?",
        options: [
          "Selección por resultado y ausencia de los calls ganados o folds comparables.",
          "Que los botes grandes nunca aportan información.",
          "Que perder elimina cualquier duda sobre la calidad del call.",
        ],
        accepted: [0],
        explanation:
          "El filtro es útil para encontrar manos relevantes, pero no representa por sí solo todas las decisiones del nodo.",
      },
      {
        prompt:
          "Has estudiado una lección vinculada a un leak. ¿Qué puedes afirmar?",
        options: [
          "Que el leak desapareció estadísticamente.",
          "Que has trabajado esa hipótesis; falta comprobar su aplicación en evidencia posterior.",
          "Que ya puedes ignorar los ejemplos que la contradicen.",
        ],
        accepted: [1],
        explanation:
          "Leer, practicar y aplicar son señales distintas. El historial debe preservar esa diferencia.",
      },
    ],
  },
  {
    slug: "nl5",
    title: "Consolidar NL5: repetir decisiones que puedes explicar",
    area: "Consolidación de NL5",
    objective: "Convertir conceptos en un proceso de revisión estable.",
    theory:
      "Consolidar un nivel combina calidad de decisiones, capacidad de adaptación y control de la exposición que tú hayas decidido asumir. Una racha positiva no demuestra preparación permanente; una racha negativa tampoco demuestra que todo el proceso sea incorrecto. La mejora se observa en explicaciones más precisas, menos errores repetidos y aplicación de tareas revisadas.",
    method: [
      "Elige un foco técnico por bloque de estudio y registra manos en las que apareció. No cambies toda tu estrategia por una sesión.",
      "Contrasta práctica y manos reales: saber elegir una respuesta sin reloj no garantiza aplicarla al jugar.",
      "Evalúa tu capacidad de reconocer incertidumbre y abandonar líneas sin objetivo, además de revisar resultados.",
    ],
    limits:
      "No se establece una promesa de winrate, número de días ni una muestra universal que garantice batir NL5. Los límites personales y la gestión de riesgo se deciden fuera de un ejercicio aislado.",
    practice:
      "Haz una revisión semanal de proceso: dos decisiones bien justificadas, un error repetido y una tarea concreta. No uses el beneficio de la semana como nota del temario.",
    questions: [
      {
        prompt:
          "Has ganado varias sesiones de NL5, pero tus revisiones siguen mostrando barrels sin plan. ¿Qué decisión de estudio es coherente?",
        options: [
          "Dar el problema por resuelto gracias al beneficio.",
          "Seguir trabajando el patrón y contrastarlo con manos, sin equiparar resultados y dominio.",
          "Cambiar todos los rangos preflop sin evidencia.",
        ],
        accepted: [1],
        explanation:
          "Los resultados y la calidad de decisiones aportan información distinta; una racha no elimina evidencia técnica.",
      },
      {
        prompt:
          "¿Qué señal muestra mejor aplicación de una lección que simplemente haberla marcado completada?",
        options: [
          "Una mano posterior con supuestos, objetivo y alternativa explicados antes de ver el resultado.",
          "El tiempo que estuvo abierta la pestaña.",
          "Recordar el título sin poder aplicar sus condiciones.",
        ],
        accepted: [0],
        explanation:
          "La aplicación contextual produce evidencia de razonamiento; tiempo y lectura son indicadores indirectos.",
      },
    ],
  },
  {
    slug: "nl10",
    title: "Preparar NL10: criterios de transición y revisión",
    area: "Preparación para NL10",
    objective:
      "Definir qué debes comprobar antes de ampliar dificultad y exposición.",
    theory:
      "Prepararse para NL10 no consiste en desbloquear una insignia. Necesitas una base técnica que puedas explicar, identificar rivales y tamaños diferentes, y conservar un proceso de revisión cuando aparezcan situaciones nuevas. El plan de transición debe incluir condiciones personales de exposición y retirada, sin tratar una promesa de resultados como evidencia.",
    method: [
      "Revisa los errores recurrentes de preflop, turn y river que siguen sin explicación; prioriza los que se trasladan a botes mayores.",
      "Distingue cambios observados del pool de suposiciones sobre «el siguiente nivel». No sustituyas lecturas por estereotipos.",
      "Escribe cuándo pausar, revisar o reducir exposición y qué señales técnicas quieres observar. Reevalúa con datos, no con necesidad de recuperar pérdidas.",
    ],
    limits:
      "Este material no garantiza ganar ni recomienda una cantidad de dinero o fecha para subir. Cualquier regla de bankroll mencionada por una fuente es contextual y no asegura evitar pérdidas.",
    practice:
      "Redacta una hoja de transición: habilidades pendientes, dudas que debes resolver, límites personales y forma de revisión. Añade tres manos que prueben aplicación, sin prometer una winrate futura.",
    questions: [
      {
        prompt:
          "Una fuente promete batir NL10 en pocos días. ¿Qué interpretación responsable debe conservar tu academia?",
        options: [
          "Una garantía aplicable a cualquier usuario que lea el temario.",
          "Una propuesta del autor que requiere contexto; estudiar no garantiza resultados ni elimina riesgo.",
          "Una estadística personal de éxito aunque no hayas jugado.",
        ],
        accepted: [1],
        explanation:
          "Una frase promocional no es una medición de tus habilidades ni una garantía de rendimiento.",
      },
      {
        prompt:
          "Tras subir de nivel detectas sizings y rangos distintos de lo esperado. ¿Qué proceso es razonable?",
        options: [
          "Recoger ejemplos, reconocer incertidumbre y revisar el ajuste manteniendo tus límites personales.",
          "Aplicar todas las explotaciones antiguas sin comprobarlas.",
          "Aumentar exposición para recuperar cualquier pérdida cuanto antes.",
        ],
        accepted: [0],
        explanation:
          "La transición requiere adaptación y revisión; la urgencia por recuperar resultados no justifica decisiones técnicas.",
      },
    ],
  },
];
