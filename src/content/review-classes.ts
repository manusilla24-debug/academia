import type { SourceClass } from "./source-classes";
import type { StudyQuestion } from "./cash-course";

export const reviewedSessions = [
  {
    id: "xg40edJoIbk",
    title: "Revisiones NL10–NL25 · Roberto y Sebas · Repaso de estrategias",
    duration: 5694,
  },
  {
    id: "5R8r4ncBGY0",
    title: "La Ley del Ex: Revisiones y Retos de Cash",
    duration: 15589,
  },
  {
    id: "kuwNmnqO_E4",
    title: "Revisión de Manos Exóticas · Manu Arenas",
    duration: 9713,
  },
  {
    id: "DydRxf9pTLY",
    title: "Revisiones Eclipse · NL10 · Luna de miel",
    duration: 808,
  },
];
interface ReviewClass {
  slug: string;
  videoId: string;
  title: string;
  module: string;
  from: number;
  to: number;
  summary: string;
  limits: string;
  teaching: SourceClass;
  questions: StudyQuestion[];
}
function lesson(
  slug: string,
  videoId: string,
  from: number,
  to: number,
  title: string,
  objective: string,
  explanation: string,
  example: string,
  method: string[],
  practice: string,
  question: StudyQuestion,
  area = "Laboratorio de manos",
): ReviewClass {
  return {
    slug,
    videoId,
    from,
    to,
    title,
    module: area,
    summary: explanation,
    limits:
      "Clase editorial basada en el intervalo enlazado de una revisión de cash. Los ejemplos son hipotéticos. Los subtítulos automáticos no permiten reconstruir con certeza todos los naipes, datos ni tamaños; no se copian cifras de equity ni frecuencias del ASR. Las expresiones absolutas del diálogo se estudian como lecturas del caso, no como leyes universales.",
    teaching: { title, objective, explanation, example, method, practice },
    questions: [question],
  };
}
export const reviewClasses: ReviewClass[] = [
  lesson(
    "cold-call-multiway",
    "xg40edJoIbk",
    1886,
    1942,
    "Cold-call multiway: no entres buscando una top pair dominada",
    "Relacionar el motivo del call preflop con las manos que esperas construir después.",
    "Entrar con una broadway después de una apertura fuerte y otro call puede parecer atractivo por el bote y por tener una mano conectada. Sin embargo, ligar una pareja no garantiza conservar valor frente a dos rangos. El agresor puede tener mejores kickers y el segundo jugador puede continuar con manos que conectan de forma distinta.\n\nAntes de pagar, diferencia las mejoras que te permiten cobrar de las que te ponen en una situación dominada. Una top pair modesta y un proyecto fuerte no realizan su equity del mismo modo. La posición, la profundidad y quién queda por actuar cambian el plan.\n\nEl criterio que trabajamos es tener una razón para el call que siga siendo válida cuando el flop no sea ideal. No se trata de memorizar que una mano concreta siempre se foldea: se trata de reconocer qué parte de su valor dependía de condiciones que no están presentes.",
    "Ejemplo hipotético: pagas QJ suited frente a UTG y otro caller. En Q72, tu pareja puede estar dominada por AQ o KQ; en una textura que te da un proyecto limpio tendrás opciones diferentes. Escribe ambas ramas antes de decidir que el call preflop era bueno por el resultado final.",
    [
      "Fija posiciones, rango de apertura supuesto y jugadores por detrás.",
      "Separa pareja dominable, proyecto y mano muy fuerte como posibles resultados del flop.",
      "Compara fold y call teniendo en cuenta cómo realizarás equity contra ambos rangos.",
    ],
    "Revisa cinco cold-calls multiway. Para cada uno escribe qué tipo de flop buscabas y qué harías con una sola pareja.",
    {
      prompt:
        "¿Qué problema puede ocultar un call preflop con una broadway en multiway?",
      options: [
        "Ligar una pareja que sigue dominada frente a los rangos que continúan.",
        "Que todas las manos suited pierden siempre.",
        "Que tener posición impide ganar botes.",
      ],
      accepted: [0],
      explanation:
        "La apariencia de la mano no elimina dominación ni dificultad de realizar equity frente a varios rangos.",
    },
    "Preflop · Laboratorio de manos",
  ),
  lesson(
    "river-pierde-valor",
    "xg40edJoIbk",
    1946,
    2111,
    "Tu mano era de valor. El river puede cambiarlo",
    "Reclasificar una mano tras un runout que fortalece el rango que pagó varias apuestas.",
    "La fuerza absoluta de tu mano no cambia necesariamente cuando cambia su función. Puedes seguir teniendo dobles o un set, pero dejar de tener suficientes calls peores en river. Las apuestas de las calles anteriores ya estrecharon el rango rival, y la carta final puede reforzarlo todavía más.\n\nLa pregunta para una nueva apuesta es actual: qué manos peores pagan ahora. Si solo encuentras mejores, la apuesta dejó de ser valor. Tomar check puede conservar showdown, pero tampoco obliga a pagar cualquier apuesta posterior. Debes reconstruir qué valor y qué faroles llegan por la secuencia.\n\nUna línea fuerte en un bote multiway puede dejar menos faroles plausibles que una defensa amplia heads-up. Eso justifica estudiar una defensa más selectiva bajo esas condiciones. No significa que todos los rivales o todos los rivers de esa familia carezcan de faroles.",
    "Ejemplo hipotético: cobras dos calles con dobles y el river completa una parte importante del rango que pagó. No evalúes el push diciendo «he apostado mucho y tengo dobles». Compara los calls peores de river con el rango que apuesta después de tu check.",
    [
      "Actualiza el rango tras cada call, antes de mirar el river.",
      "Vuelve a buscar calls peores frente a tu tamaño final.",
      "Si eliges check, prepara una defensa según precio, valor y faroles plausibles.",
    ],
    "Busca tres manos fuertes en las que el river cambió tu plan. Señala exactamente qué familias de manos mejoraron.",
    {
      prompt:
        "Después de dos apuestas de valor, el river refuerza el rango que pagó. ¿Qué debes comprobar antes de pushear?",
      options: [
        "Si la inversión anterior obliga a terminar all-in.",
        "Qué manos peores todavía pagan la nueva apuesta.",
        "Solo el nombre absoluto de tu mano.",
      ],
      accepted: [1],
      explanation:
        "La función de valor se determina contra el rango de call actual. Las apuestas anteriores no garantizan nuevos calls peores.",
    },
    "River · Laboratorio de manos",
  ),
  lesson(
    "raise-tras-overbet",
    "xg40edJoIbk",
    3879,
    3986,
    "Te resuben una overbet: vuelve a mirar el rango",
    "Distinguir fuerza de mano y fuerza de la respuesta rival antes de defender una apuesta grande.",
    "Cuando apuestas muy grande, el rival debe responder a un precio distinto. Si además resube, su acción merece una evaluación nueva. No puedes asignarle el mismo rango que tenía antes de tu overbet. Una mano fuerte frente al rango inicial puede ser débil frente al rango que decide subir esa apuesta.\n\nReconstruye primero sus manos de valor y después los faroles capaces de tomar esa línea. Los blockers no sustituyen esta lista. Tampoco sirve defender el bote porque te moleste que te resuban. El dinero ya apostado pertenece al bote: el call adicional debe justificarse con su coste actual.\n\nEn la revisión se interpreta una respuesta concreta como muy cargada de valor. Trabajaremos el procedimiento que permite llegar a esa hipótesis, manteniendo abierta la posibilidad de que otro perfil resuba con otra composición.",
    "Ejemplo hipotético: haces una apuesta mayor que el bote y recibes un raise en una textura con escalera posible. Antes de pagar con una mano inferior, enumera qué valor peor resubiría y qué faroles usaría el rival. «Tengo una mano enorme» no contesta ninguna de las dos preguntas.",
    [
      "Describe el rango que llega y el que resube tu tamaño.",
      "Calcula el precio del call adicional sin contar la inversión anterior como motivo.",
      "Busca evidencia específica de raises de farol en ese nodo.",
    ],
    "Revisa tres raises recibidos después de apuestas grandes. Escribe qué cambió entre su rango de call y su rango de raise.",
    {
      prompt: "¿Qué rango importa después de que resuban tu overbet?",
      options: [
        "El rango con el que abrió preflop, sin actualizar.",
        "Solo la mano que mostró al final.",
        "El rango que toma esa resubida frente a tu tamaño y tu línea.",
      ],
      accepted: [2],
      explanation:
        "La resubida aporta información nueva. Tu defensa se evalúa frente a esa respuesta y al precio actual.",
    },
  ),
  lesson(
    "call-conserva-faroles",
    "5R8r4ncBGY0",
    188,
    322,
    "Por qué pagar puede ser mejor que resubir una mano fuerte",
    "Comparar el rango que apuesta con el rango que paga tu raise.",
    "Una mano fuerte no siempre quiere resubir. Si el rival apuesta valor y faroles, pagar mantiene ambas partes dentro del bote. Al subir puedes expulsar los faroles y recibir acción solo de las manos que te ganan. El raise compromete más dinero sin necesariamente cobrar a más manos peores.\n\nEsta comparación explica por qué agresión y rentabilidad no son sinónimos. Antes de subir, nombra el valor peor que continúa. Si tu argumento es que vas por delante de muchos faroles, eso puede justificar un call, pero no demuestra que el raise sea mejor.\n\nLa decisión cambia si existen suficientes manos peores que pagan tu subida o si el precio de continuar y las cartas futuras alteran la comparación. Conserva esas condiciones; no conviertas la idea en una prohibición general de subir.",
    "Ejemplo hipotético: en river el rival apuesta con manos muy fuertes y proyectos fallidos. Tu mano gana a los proyectos y pierde contra su valor. Si todos los proyectos foldean ante tu raise, subir no añade cobros de esos faroles. Compara primero call y fold; el raise necesita su propio motivo.",
    [
      "Separa el rango que apuesta del que paga una resubida.",
      "Nombra las manos peores que seguirían contra tu raise.",
      "Si solo mantienes mejores, compara una defensa pasiva con el precio del call.",
    ],
    "Busca dos raises con los que expulsaste aire rival. Escribe qué habría cambiado si hubieras pagado.",
    {
      prompt:
        "Ganas a los faroles que apuesta el rival, pero todos abandonan ante raise y solo sigue su valor mejor. ¿Qué falla al subir?",
      options: [
        "Confundes ganar al rango que apuesta con cobrar al rango que paga tu subida.",
        "Que pagar nunca permite ganar.",
        "Que toda mano fuerte debe abandonar.",
      ],
      accepted: [0],
      explanation:
        "El raise puede aislarte frente a mejores. Que un call capture faroles no hace automáticamente rentable añadir una resubida.",
    },
  ),
  lesson(
    "profundidad-agresion",
    "5R8r4ncBGY0",
    365,
    402,
    "Más profundidad, otra decisión: no copies el plan de 100 BB",
    "Reconocer cómo el stack efectivo cambia la exposición y las continuaciones.",
    "Jugar más profundo no es simplemente jugar el mismo bote con más fichas. Un raise puede dejar una cantidad importante por detrás y exigir decisiones adicionales. Las manos que pagan o suben pueden cambiar cuando el coste total de confrontación crece.\n\nEl stack relevante es el efectivo entre los jugadores implicados, y debe relacionarse con el bote actual. Una línea que compromete el stack con poco dinero restante puede ser diferente de otra que aún admite varios tamaños grandes. Antes de trasladar una respuesta de un ejemplo de 100 BB a uno más profundo, vuelve a construir el plan.\n\nNo inferimos una frecuencia universal menor de farol por estar deep. Evaluamos cómo profundidad, perfil y secuencia afectan a este nodo. La incertidumbre sobre el rango rival merece anotarse, no llenarse con una receta.",
    "Ejemplo hipotético: comparas la misma top pair en un bote con poco stack detrás y en otro con varias apuestas de bote disponibles. En el segundo caso, pagar un raise no es necesariamente la última decisión. Escribe qué ocurriría ante un nuevo barrel antes de comprometerte.",
    [
      "Anota stack efectivo y bote, no solo el stack con el que empezó la sesión.",
      "Proyecta cuánto quedará tras call, bet o raise.",
      "Revisa qué manos continúan y qué decisiones futuras quedan abiertas.",
    ],
    "Toma una mano a 100 BB y replantea sus decisiones con mayor profundidad. Mantén el rival y pregunta qué supuestos dejan de sostenerse.",
    {
      prompt:
        "¿Por qué no copiar automáticamente una línea de 100 BB estando más profundo?",
      options: [
        "Porque la profundidad no afecta a las decisiones.",
        "Porque cambian la exposición, el dinero restante y las posibles continuaciones.",
        "Porque estando deep nadie farolea nunca.",
      ],
      accepted: [1],
      explanation:
        "El stack efectivo cambia las consecuencias del plan. Eso exige reevaluar rangos y costes sin inventar una frecuencia universal.",
    },
  ),
  lesson(
    "color-completado-sizing",
    "5R8r4ncBGY0",
    1513,
    1640,
    "Se completa el color: elige tamaño mirando quién te paga",
    "Actualizar los calls peores y el tamaño de valor al completarse el proyecto principal.",
    "Una carta que completa el proyecto principal cambia tanto la fuerza relativa de tu mano como la respuesta rival. No basta con conservar una overpair y seguir el tamaño previsto. Algunas manos peores abandonarán antes y otras manos que antes eran proyectos ahora te ganan.\n\nLa pregunta útil es qué rango continúa frente a cada tamaño. Una apuesta mayor puede aislarte contra colores completados si expulsa las parejas a las que querías cobrar. Un tamaño más moderado puede conservar ciertos calls peores, aunque todavía necesita justificar su objetivo. Check también es una alternativa que debe evaluarse.\n\nEsta comparación no afirma que en todos los boards con color completado debas apostar pequeño. Si tu mano, blockers o perfil producen otra respuesta, cambia el análisis. Lo que queremos eliminar es la apuesta grande por inercia.",
    "Ejemplo hipotético: tienes una overpair y llega la tercera carta de un palo presente en flop. Compara quién paga medio bote y quién paga una overbet. Si todas las parejas peores foldean la segunda, el tamaño grande puede dejar de cobrar el valor que esperabas.",
    [
      "Actualiza proyectos completados y parejas que aún continúan.",
      "Compara los rangos de call de dos tamaños con check.",
      "Incluye tus blockers relevantes y la respuesta ante raise.",
    ],
    "Revisa cinco turns que completan color. Lista los calls peores antes de seleccionar el tamaño.",
    {
      prompt:
        "Una overbet expulsa todas las parejas peores y recibe calls de colores que te ganan. ¿Qué debes revisar?",
      options: [
        "El rango que continúa y la alternativa de un tamaño distinto o check.",
        "Si apostar más fuerte demuestra más confianza.",
        "Solo si tu overpair ganó la última vez.",
      ],
      accepted: [0],
      explanation:
        "El tamaño modifica el rango que paga. La fuerza relativa se evalúa contra esa continuación, no contra el rango anterior.",
    },
    "Valor · Laboratorio de manos",
  ),
  lesson(
    "multiway-no-headsup",
    "5R8r4ncBGY0",
    7370,
    7485,
    "Multiway: tu mano juega contra más de un rango",
    "Evitar trasladar apuestas y valor relativo de heads-up a botes de varios jugadores.",
    "En multiway tu apuesta debe superar la respuesta de más de un rango. Que una mano sea fuerte contra uno no garantiza que tenga la misma ventaja frente a ambos. Los proyectos y las manos fuertes se distribuyen entre varios jugadores, y tu posición relativa puede complicar las siguientes calles.\n\nAntes de apostar por valor, nombra qué manos peores pagan en cada rival. Después considera qué ocurre si paga uno, pagan dos o alguien resube. Apostar grande por protección no elimina esa evaluación: la protección tiene un coste y puede estrechar la continuación a manos más fuertes.\n\nEn la revisión se compara un tamaño más contenido con la tentación de inflar el bote. Conservamos la razón de esa comparación, no una regla de apostar siempre pequeño en multiway. Tu mano, la textura y los perfiles pueden justificar una respuesta distinta.",
    "Ejemplo hipotético: tienes top pair y dos rivales en un board con proyectos. Compara una apuesta moderada con una grande. Si el tamaño mayor elimina todas las parejas peores pero conserva proyectos fuertes y dobles, no has probado que la protección compense el cambio de rango.",
    [
      "Construye por separado las continuaciones de ambos rivales.",
      "Revisa cómo cambia tu mano cuando uno o los dos pagan.",
      "Compara tamaños y check incluyendo posición y cartas futuras.",
    ],
    "Compara tres manos heads-up y tres multiway con una pareja. Escribe por qué el mismo nombre de mano puede exigir planes distintos.",
    {
      prompt: "¿Qué debes añadir al evaluar una apuesta de valor multiway?",
      options: [
        "Solo el rango del rival que parece más débil.",
        "Los rangos y respuestas de todos los jugadores que continúan.",
        "Una obligación de hacer overbet para proteger.",
      ],
      accepted: [1],
      explanation:
        "La presencia de varios rangos cambia fuerza relativa, respuesta y decisiones futuras. No basta con trasladar un plan heads-up.",
    },
  ),
  lesson(
    "no-raise-minibet",
    "5R8r4ncBGY0",
    9470,
    9615,
    "Una apuesta minúscula no obliga a convertir tu pareja en farol",
    "Evaluar un precio pequeño sin responder por frustración o por probar.",
    "Las apuestas muy pequeñas pueden resultar molestas porque parecen invitar a subir. Pero el tamaño extraño no decide la función de tu mano. Si conservas showdown y pagas poco para continuar, convertirla en farol exige explicar qué ganas respecto a pagar.\n\nUn raise puede tirar aire al que ya ganabas y mantener manos mejores. Si el precio ofrecido permite continuar con comodidad bajo tus supuestos, no necesitas ganar el bote de inmediato. El plan sigue dependiendo de la calle, las cartas futuras y de quién queda por hablar.\n\nLa frustración ante una apuesta repetida no es una lectura de rango. Separa «creo que es débil» de «tengo evidencia de que foldea suficientes manos mejores». Solo la segunda frase empieza a justificar una subida de farol.",
    "Ejemplo hipotético: tienes una pareja que gana a parte del aire rival y recibes una apuesta de 1 BB en un bote de 17 BB. Sin dar un call automático, compara su coste con el de subir y con las manos que continuarían. Que el rival abandone basura ante raise no demuestra que tu subida mejore el resultado.",
    [
      "Calcula el precio y revisa qué showdown conservas.",
      "Compara el rango que apuesta pequeño con el que paga tu raise.",
      "Exige un objetivo de valor o de folds mejores antes de subir.",
    ],
    "Encuentra tres raises contra apuestas pequeñas y anota si estaban motivados por valor, farol o irritación.",
    {
      prompt:
        "El rival apuesta muy pequeño y tu pareja puede ganar al showdown. ¿Qué falta antes de subir?",
      options: [
        "Saber si el tamaño te molesta.",
        "Que hayas perdido el bote anterior.",
        "Justificar qué calls peores o folds mejores obtiene el raise frente a pagar.",
      ],
      accepted: [2],
      explanation:
        "El tamaño pequeño no anula el showdown de tu mano. La subida necesita mejorar la comparación con las alternativas.",
    },
  ),
  lesson(
    "inducir-perfil",
    "kuwNmnqO_E4",
    1380,
    1480,
    "Inducir faroles: necesitas un rival que realmente apueste",
    "Relacionar un check de inducción con una tendencia observada del rival.",
    "Chequear una mano fuerte puede conservar faroles, pero esa inducción solo tiene valor si el rival los apuesta. Frente a alguien pasivo, regalarle la posibilidad de check puede perder cobros de manos peores que habrían pagado. Frente a alguien que convierte demasiadas manos débiles en apuestas, el check puede capturar esa agresión.\n\nLa clave es el perfil concreto y el nodo. Que un rival sea agresivo preflop no demuestra que farolee todos los rivers; una lectura general necesita afinarse con la línea y la textura. También importa cuánta protección requiere tu mano y cómo cambia con la siguiente carta.\n\nEsta clase te obliga a nombrar la lectura que sostiene el plan. Si no existe, no conviertas el check de inducción en una receta. Compara cuánto valor podrías cobrar apostando y cuánto recuperarías manteniendo sus apuestas peores.",
    "Ejemplo hipotético: un rival ha mostrado varios barrels de aire después de check rival en la misma familia de botes. Con una mano que puede sostener la defensa, estudiar check tiene sentido. Contra alguien que casi siempre toma check con aire, necesitas otra justificación.",
    [
      "Describe la conducta observada y la calle en la que ocurre.",
      "Compara el valor que cobras apostando con las apuestas peores que conserva check.",
      "Prepara la defensa ante tamaños distintos y runouts desfavorables.",
    ],
    "Escribe una nota de un rival que apuesta demasiado y otra de uno que paga demasiado. Explica por qué no reclaman el mismo ajuste.",
    {
      prompt: "¿Qué dato sostiene un check con intención de inducir faroles?",
      options: [
        "Que el rival apueste suficientes manos peores en ese nodo.",
        "Que el rival pague muchos opens preflop.",
        "Que chequear siempre sea más sofisticado.",
      ],
      accepted: [0],
      explanation:
        "La inducción depende de la respuesta a tu check. Pagar mucho y apostar de farol son tendencias diferentes.",
    },
  ),
  lesson(
    "blocker-faroles",
    "kuwNmnqO_E4",
    2600,
    2645,
    "Bluffcatch y blockers: no bloquees las manos que quieres encontrar",
    "Entender por qué quitar combinaciones de farol puede empeorar un bluffcatch.",
    "Un blocker afecta a la cantidad de ciertas manos disponibles para el rival. Para un bluffcatcher, no basta con decir que bloqueas una mano fuerte: también debes comprobar qué faroles eliminas. Si tu carta reduce proyectos fallidos que el rival habría apostado, el rango restante puede concentrar más valor.\n\nLa dirección del efecto depende de la composición del rango. Una carta puede bloquear valor y faroles a la vez, o afectar manos que ni siquiera toman esa línea. Por eso el orden correcto es construir el rango de apuesta y después estudiar tus cartas, no elegir el call porque ves un blocker llamativo.\n\nLa revisión discute ese contraste en una mano concreta. Aquí trabajamos el procedimiento, sin reconstruir naipes ambiguos ni afirmar que una carta aislada determina la defensa.",
    "Ejemplo hipotético: falló un proyecto de color y consideras pagar con una mano que contiene una carta de ese palo. Esa carta puede eliminar algunos de los proyectos fallidos que querías que el rival tuviera. Comprueba también si elimina valor y si esos proyectos realmente apostarían river.",
    [
      "Enumera valor y faroles que llegan a la apuesta.",
      "Marca qué combinaciones retiran tus cartas en cada grupo.",
      "Vuelve a comparar el rango con el precio del call y el perfil.",
    ],
    "Compara dos bluffcatchers de igual fuerza absoluta y distinto palo. Explica qué manos del rango rival deja disponibles cada uno.",
    {
      prompt:
        "Tu carta bloquea proyectos fallidos que el rival sí farolearía. ¿Qué efecto debes estudiar?",
      options: [
        "Que elimina parte del farol que querías encontrar al pagar.",
        "Que garantiza que el rival lleva valor.",
        "Que todos los blockers mejoran cualquier call.",
      ],
      accepted: [0],
      explanation:
        "Reducir faroles puede empeorar el bluffcatch, pero el efecto completo exige comparar también el valor bloqueado y el precio.",
    },
    "Bluffcatching · Laboratorio de manos",
  ),
  lesson(
    "nota-tras-checkback",
    "kuwNmnqO_E4",
    6483,
    6500,
    "El showdown sirve para escribir una nota que cambie decisiones",
    "Registrar una observación concreta sin convertir una mano en una estadística.",
    "Cuando una mano llega al showdown, obtienes información sobre una secuencia, no solo sobre el resultado. Puedes observar con qué rango pagó un tamaño y qué hizo cuando se le ofreció check. Esa información ayuda a plantear ajustes en futuras manos comparables.\n\nUna nota útil conserva posiciones, textura, secuencia y mano mostrada. Una etiqueta como «paga todo» borra el contexto y extrapola demasiado. Tampoco confundas un call amplio en turn con una disposición a pagar cualquier apuesta de river. Son decisiones distintas.\n\nEl aprendizaje consiste en formular una hipótesis que puedas contrastar: quizás este rival paga una overbet con una familia más débil de lo esperado. La próxima revisión buscará más ejemplos y excepciones. Una sola mano no estima su frecuencia real.",
    "Ejemplo hipotético de nota: «BB vs BTN, pagó apuesta grande en turn con una pareja media y tomó check en river». Es mucho más informativo que «es un calling station». Añade que es una observación y no una frecuencia estable.",
    [
      "Guarda acción, calle y tamaño observado.",
      "Relaciona la mano mostrada con tu rango supuesto antes de verla.",
      "Formula una hipótesis y busca más manos comparables antes de ampliar el ajuste.",
    ],
    "Reescribe tres etiquetas vagas de tus notas en observaciones verificables con su contexto.",
    {
      prompt:
        "Después de ver un call amplio una vez, ¿qué nota es más defendible?",
      options: [
        "Siempre paga cualquier tamaño.",
        "La secuencia y mano observadas, como hipótesis para revisar en más casos.",
        "No puede farolear nunca.",
      ],
      accepted: [1],
      explanation:
        "La evidencia de una mano mejora una hipótesis contextual. No demuestra una conducta universal ni una frecuencia estable.",
    },
  ),
  lesson(
    "cerrar-mano-nota",
    "DydRxf9pTLY",
    378,
    435,
    "Toma la nota y suelta el resultado de la mano",
    "Separar la información útil de un showdown del impulso de recuperar lo perdido.",
    "Una mano complicada puede terminar perdiéndose aunque tu razonamiento haya sido razonable. El trabajo después del showdown es recoger la información que faltaba, revisar si cambia tu rango supuesto y cerrar la mano. Repetir mentalmente la pérdida no mejora la siguiente decisión.\n\nUna nota debe describir lo observado: cómo jugó el rival una familia de manos, en qué textura y con qué secuencia. La conclusión puede ser que tu modelo necesita un ajuste o que todavía falta evidencia. Ambas son más útiles que convertir el resultado en una valoración de tu nivel.\n\nCerrar la mano no significa ignorar errores. Significa guardarlos como una tarea concreta para una revisión fuera de sesión. Así separas el estudio del impulso de compensar una pérdida con más exposición o con una decisión precipitada.",
    "Ejemplo hipotético: pierdes después de pagar una línea difícil. Marca la mano, escribe qué dato sorprendió y vuelve a revisarla sin resultado. Evita convertir «esta vez mostró valor» en «nunca farolea» o en «tengo que ganarle el próximo bote».",
    [
      "Recoge hechos nuevos y señala los supuestos que cambiaron.",
      "Guarda una nota breve o una tarea de revisión.",
      "Evalúa la próxima mano con su propia información.",
    ],
    "Revisa una mano que sigas recordando por frustración. Redúcela a un hecho observado y una pregunta técnica.",
    {
      prompt:
        "Tras una mano difícil perdida, ¿qué tarea conserva el aprendizaje?",
      options: [
        "Recuperar el dinero en la siguiente mano.",
        "Anotar la observación y revisar el proceso sin sesgo del resultado.",
        "Concluir que todos los calls fueron errores.",
      ],
      accepted: [1],
      explanation:
        "Guardar hechos y una tarea de revisión permite aprender sin trasladar la pérdida a la siguiente decisión.",
    },
  ),
];
