# Rediseño de la academia

La tarea principal es aprender una decisión, comprender sus condiciones y aplicarla a una mano propia. La portada propone una siguiente clase; el temario ordena conceptos en cuatro rutas; las revisiones conectan las sesiones originales con las clases desarrolladas.

## Dirección visual

Tinta oscura, verde de mesa y acento lima; titulares editoriales con Georgia y controles con la tipografía del sistema. No se descargan fuentes ni imágenes de terceros. Las cartas y fichas de portada están dibujadas con CSS y separadas de las cartas del visualizador de manos.

Referencias consultadas en GitHub:

- [shadcn/ui](https://github.com/shadcn-ui/ui): componentes, jerarquía y composición. Se conserva la atribución de los componentes ya adaptados en THIRD_PARTY_NOTICES.md.
- [shadcn-admin](https://github.com/satnaing/shadcn-admin): organización de navegación y espacio de trabajo.
- [course-platform](https://github.com/farizkydy/course-platform): separación entre recorrido, clase y práctica.

El nuevo diseño y las nuevas composiciones son propios; no se han copiado plantillas completas de esos proyectos ni añadido sus dependencias.

## Clases y procedencia

- 24 clases editoriales: seis nuevas y las 18 anteriores ampliadas con ejemplos hipotéticos.
- 22 clases con intervalos de fuentes reales, instalables únicamente cuando existe la transcripción correspondiente.
- 72 ejercicios no DEMO y 46 fichas en la base local actual. Las preguntas que siguen pendientes de revisión conservan ese estado.
- Cuatro sesiones adicionales con duraciones verificadas en YouTube: Roberto y Sebas (1:34:54), La Ley del Ex (4:19:49), Manos Exóticas (2:41:53) y Eclipse (13:28).

Las transcripciones originales permanecen en `data/channel-transcripts/`, ignoradas por Git. La actualización importa los intervalos utilizados por las clases nuevas; no presenta sesiones mixtas enteras como contenido cash revisado. Las manos hipotéticas se identifican como tales. Las cifras de pot odds de los ejemplos son aritmética bajo supuestos explícitos, no frecuencias medidas de una población.

Una sesión catalogada, una transcripción disponible y una clase desarrollada son estados diferentes. Ninguno implica haber analizado todas las horas del canal. La sección Revisiones muestra su cobertura a partir del estado real de la base.

## Actualización

`npm run academy:upgrade` crea una copia SQLite mediante VACUUM INTO antes de actualizar la base local. Instala clases nuevas, amplía exclusivamente el texto original v1 que coincide exactamente y conserva revisiones, notas, favoritos, respuestas y progreso. No sustituye ediciones personales. En Supabase utiliza la base configurada y no crea una copia SQLite; debe emplearse el mecanismo de backup del proveedor.

No se cobran llamadas de IA al instalar este material. Las generaciones futuras por IA reciben instrucciones para enseñar conceptos y evaluar decisiones, manteniendo citas y procedencia por separado. El modo extractivo sigue produciendo preparaciones de clase en borrador.

## Verificación

La prueba de navegador `z-academy.spec.ts` recorre portada → clase → entrenador filtrado → clase → respuesta integrada → notas y progreso → búsqueda de clases → revisiones. Comprueba persistencia al recargar y ausencia de desbordamiento a 390 px en las diez secciones. Las capturas están en `test-results/` y no se publican en Git.
