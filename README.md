# Poker Study Lab

Academia privada de cash No-Limit Hold’em, en español, orientada a recuperar NL2 y consolidar NL5 antes de NL10. Next.js / React / TypeScript, fuentes verificables, worker persistente, lecciones revisables, búsqueda, ejercicios, SM-2, manos, leaks y exportaciones. Sin asistencia durante partidas.

## Estado de la academia

Academia rediseñada: una siguiente clase, cuatro rutas por conceptos, práctica dentro de las clases y un laboratorio de revisiones de manos. Diseño tinta / verde lima, adaptable a móvil. Inspiración y decisiones en [docs/design.md](docs/design.md). Se conserva la atribución de los componentes adaptados de shadcn/ui en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Ruta editorial propia: **24 clases y 48 ejercicios**, identificados como material original independiente del canal. Las 18 clases anteriores incorporan ejemplos razonados y se añaden seis clases sobre estrategia, bluffcatch NL2, valor, faroles, rangos y cómo estudiar sesiones largas. El catálogo incluido contiene **57 referencias públicas observadas**, no el histórico entero. La base local actual tiene **46 clases publicadas, 22 de ellas vinculadas a fuentes, 72 ejercicios y 46 fichas**. Se han obtenido cuatro transcripciones adicionales de revisiones y se importan los intervalos trabajados. Las transcripciones y datos privados no se publican en Git.

No se afirma haber importado todo el canal ni garantizar ganar o batir NL10. Los subtítulos automáticos no permiten reconstruir todos los boards, sizings o estadísticas. Cada síntesis distingue interpretación, fuente y datos ausentes.

Para cargar el material incluido en una base nueva:

```powershell
npm run curriculum
npm run channel:catalogue
npm run youtube:sync
# Actualizar la academia y desarrollar las clases cuyas fuentes están disponibles:
npm run academy:upgrade
```

Sin key, `youtube:sync` consulta RSS oficial reciente; con `YOUTUBE_API_KEY`, recorre el histórico paginado. Los vídeos sin transcripción no producen conocimiento ficticio. `channel:curate` solo desarrolla las clases con sus transcripciones reales disponibles. `academy:upgrade` guarda antes una copia SQLite local, conserva ediciones personales y mantiene notas, respuestas y progreso. Una base nueva sin las transcripciones privadas tendrá las 24 clases editoriales; las otras 22 necesitan sus fuentes.

## Inicio local

Node.js **22.13 o superior**; probado con Node 24.15. SQLite usa `node:sqlite`, sin servidor adicional. Next.js y los comandos CLI cargan `.env.local`.

```powershell
npm ci
# Solo si no existe una configuración local:
Copy-Item .env.example .env.local
npm run dev
```

En `.env.local` configura `APP_MODE=local`, `LOCAL_DEMO_LOGIN=true` y `SESSION_SECRET` aleatorio ≥32 caracteres. Puedes generarlo con `[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`. **Este workspace ya tiene configuración local ignorada por Git; no la sobrescribas.**

Abre [el laboratorio](http://127.0.0.1:3000). En una configuración nueva puedes habilitar expresamente el acceso DEMO de desarrollo. En el workspace actual está desactivado y se usa la contraseña elegida por el propietario, guardada mediante hash con salt en `.env.local`. No forma parte del repositorio. Los ejemplos DEMO se cargan desde Ajustes o con `npm run seed` y están separados del temario real.

Para acceso local privado, pon `LOCAL_DEMO_LOGIN=false`, `LOCAL_PASSWORD_HASH` (scrypt, `salt:hex`) o `LOCAL_PASSWORD`, y `SESSION_SECRET`. El mínimo local predeterminado es 12 caracteres; el propietario puede definir otro con `LOCAL_PASSWORD_MIN_LENGTH`. El acceso DEMO está siempre deshabilitado en producción. El servidor escucha en loopback. SQLite se rechaza en Vercel: allí usa Supabase.

## Flujo funcional

1. **Biblioteca:** pega hasta 50 URLs. Con `YOUTUBE_API_KEY` recupera metadatos públicos; sin clave conserva URLs con metadatos pendientes.
2. Sube TXT/SRT/VTT autorizado o pega texto. Conserva tiempos originales de cues; TXT no produce segundos. Límite local: 8 MB por archivo.
3. Crea un trabajo extractivo gratuito o estima y confirma un presupuesto para IA.
4. Ejecuta el worker con acceso a **la misma base de datos** que la app:

   ```powershell
   npm run worker -- --once
   # Ejecución parcial y reanudación:
   npm run worker -- --once --max-steps=2
   npm run worker
   ```

5. La interfaz muestra checkpoints, errores, pausa y reanudación. Ninguna petición HTTP de Vercel ejecuta el pipeline largo. El CLI consume la cola disponible y termina; no es un daemon ni una automatización externa.
6. **Mi academia:** contrasta el borrador con sus fuentes, edita y publica. Se conserva historial de versiones y enlaces de YouTube al inicio del cue original.
7. Guarda notas, favoritos y lectura completada. **Preparar práctica** crea preguntas y flashcards; los ejercicios generados requieren revisión explícita antes de responder.
8. Guarda respuestas y repasos SM-2. Un fallo puntual se presenta como pista de repaso, no como leak estadísticamente demostrado.
9. Busca fragmentos, registra manos con el editor de campos/acciones o importa JSON propio y asocia evidencias a hipótesis de leaks.
10. Exporta datos personales a JSON o lecciones/notas/fuentes a Markdown.

**Sin IA:** el motor extractivo conserva fragmentos y propone lectura guiada. No finge una síntesis estratégica. Para resumir e interpretar se necesita IA o edición personal. **Con IA:** un proveedor compatible con Chat Completions devuelve conceptos/preguntas revisables, con Zod y citas literales verificadas. Una cita existente no demuestra que toda la interpretación sea correcta; por eso el material comienza como borrador.

## Canal y lotes

Canal inicial: [Club de Póker de Tus Sueños](https://www.youtube.com/@ClubdePokerDeTusSue%C3%B1os). La sincronización usa `channels.forHandle`, uploads, paginación de 50 y `videos.list`. Deduplica por `youtubeId`, omite vídeos no públicos y conserva estados al actualizar metadatos. La UI importa una página por acción. El CLI recorre todas las páginas y guarda el cursor:

```powershell
npm run youtube:sync
```

Tras un fallo vuelve a ejecutar. Un cursor caducado puede requerir reiniciar `settings.channelSync` administrativamente. El clasificador léxico excluye PLO/MTT/torneos y permite corregir la relevancia manualmente; no es semánticamente infalible.

La API oficial de metadatos **no descarga captions de vídeos ajenos**. No hay scraping ni descarga de vídeos. Se procesan transcripciones aportadas legítimamente.

Para importar archivos por lotes crea un manifiesto con rutas relativas a su ubicación:

```json
[
  {
    "url": "https://www.youtube.com/watch?v=ID_REAL_11C",
    "title": "Título real",
    "file": "./transcripciones/video.srt"
  }
]
```

```powershell
npm run import -- --manifest=mi-lote.json --queue
npm run worker
```

`--queue` encola modo extractivo y no gasta en IA. Cada elemento es transaccional e idempotente; los completados se conservan si falla otro. En Supabase el CLI conserva la fuente en PostgreSQL; las subidas de la app guardan además el original en Storage privado. El CLI evita el límite de cuerpo HTTP de Vercel.

## IA y costes

| Variable de servidor        | Uso                                                            |
| --------------------------- | -------------------------------------------------------------- |
| `AI_API_KEY`                | Clave privada                                                  |
| `AI_BASE_URL`               | Base HTTPS compatible, por ejemplo `https://api.openai.com/v1` |
| `AI_MODEL`                  | Modelo elegido                                                 |
| `AI_INPUT_USD_PER_MILLION`  | Precio vigente de entrada por millón de tokens                 |
| `AI_OUTPUT_USD_PER_MILLION` | Precio vigente de salida por millón de tokens                  |
| `YOUTUBE_API_KEY`           | YouTube Data API v3, solo metadatos                            |

No hay precios de modelos codificados. Cada llamada tiene timeout de 90 segundos y solicita un máximo de 4.000 tokens de salida. La estimación reserva caracteres/2 + 800 tokens de entrada y la salida máxima. **Es una estimación, no un límite contractual de facturación.** Configura además el límite del proveedor si necesitas un techo estricto.

Antes de llamar se guarda una reserva. Si el proceso muere después de facturar y antes del checkpoint, esa reserva sigue contando. Un reintento necesita presupuesto restante: no es posible garantizar exactamente una llamada facturada ante un fallo entre proveedor y persistencia. Se registran consumo/modelo/coste o estimación conservadora cuando faltan métricas.

Se reutilizan trabajos idénticos de vídeo/transcripción/motor y checkpoints completados. Los bloques idénticos de un trabajo IA comparten una caché persistente por hash y evitan llamadas adicionales. El modelo queda fijado al crear el trabajo: si cambias su configuración, restaúrala antes de reanudar. La regeneración por versión de prompt/modelo queda pendiente. El interruptor de Ajustes detiene llamadas nuevas después del checkpoint; no cancela llamadas ya enviadas. El presupuesto implementado es por vídeo, no compartido entre todos los trabajos de un lote.

## Supabase, GitHub y Vercel

Guía: [docs/deployment.md](docs/deployment.md). Esquema: [src/lib/db/schema.ts](src/lib/db/schema.ts). Migraciones: [migrations](migrations). RLS: [supabase/security.sql](supabase/security.sql).

1. Crea Supabase, desactiva nuevos registros y crea el único usuario propietario administrativamente.
2. Configura `APP_MODE=supabase`, `DATABASE_URL` del pooler con TLS, URL/anon key de Supabase y `OWNER_USER_ID`.
3. Ejecuta `npm run db:migrate` e inserta el UUID del propietario en `public.app_owner`, según la guía.
4. Vincula un repositorio privado a Vercel, configura variables y compila con `npm run build`. Usa Node 24 o 22.
5. Ejecuta el worker fuera de HTTP Vercel con la misma base y configuración.

El repositorio de destino es `manusilla24-debug/academia`. Publicar código no despliega la web en Vercel ni publica las transcripciones o la base privada. Supabase y la generación por proveedor IA requieren credenciales; RSS y exportaciones legítimas del navegador se han utilizado con fuentes reales. No se han ejecutado llamadas facturadas al proveedor IA de la app.

## Pruebas

```powershell
npm run security:check
npm run typecheck
npm run lint
npm test
npm run build
npm exec playwright install chromium
npm run test:e2e
```

`security:check` revisa archivos publicables y el historial de Git sin imprimir valores de credenciales. Rechaza archivos privados, claves reconocibles y contraseñas en URLs de conexión. También contrasta secretos de la configuración local cuando están disponibles. CI ejecuta esta comprobación con el historial completo. Este control no revoca contraseñas en Supabase ni elimina configuraciones de despliegues antiguos.

Vitest cubre parsers, segmentación larga, clasificación, cartas/stacks/calles, ejercicios, SM-2, citas falsas, checkpoints/idempotencia/fallos, sesiones, CSRF, endpoints y proveedores con respuestas controladas. PGlite ejecuta la migración y verifica FKs, índice full-text y RLS de propietario; no equivale a una conexión real con Supabase.

El E2E usa Chromium, Next, SQLite aislado y el worker real. Recorre fuente → transcripción → procesamiento → revisión/publicación → notas/progreso → práctica → búsqueda → exportación; verifica móvil de 390 px. Artefactos en `test-results/`, ignorados por Git. Detalles: [docs/verification.md](docs/verification.md).

## Arquitectura y límites

Drizzle se elige por su esquema tipado y migraciones SQL inspeccionables. PostgreSQL conserva entidades con IDs/FKs, procedencia y payload JSONB versionado; SQLite conserva el agregado personal en una transacción. Las llamadas externas se ejecutan fuera del lock. El worker toma leases de tres minutos y confirma cada checkpoint con sus conceptos. Contratos separados para metadatos, transcripción, almacenamiento y extracción.

Es una primera versión útil, con estos límites explícitos:

- Sin transcripción de audio/vídeo ni integración externa de captions. Solo archivos/texto legítimos aportados.
- Búsqueda full-text española en PostgreSQL y léxica en local. Devuelve fragmentos e interpretaciones guardadas; no hay embeddings, pgvector ni síntesis RAG nueva por consulta.
- Consolidación de duplicados exactos. Detección de contradicciones, prerrequisitos avanzados y generación de spots numéricos quedan pendientes. Si faltan datos, IA genera cuestiones conceptuales.
- Sin cálculo de EV/equity ni solver. Manos: cartas únicas, board por calle, orden de calles, stack y aportaciones. No hay motor completo de turnos de apuestas, mínimos de raise, side pots, rake o reconciliación de todos los stacks; se admiten historiales parciales.
- Sin parser de historiales de salas; sí editor manual y formato JSON documentado en la interfaz.
- El snapshot omite el texto/cues íntegros de transcripciones y muestra previews de segmentos, cuyo texto completo se obtiene bajo demanda. El repositorio aún carga el agregado completo para mutations; bibliotecas enormes requieren paginación y SQL específico.
- Exportación JSON/Markdown implementada; restauración integral JSON, resaltados persistentes y sesiones cronometradas pendientes. Para backups restaurables usa SQLite detenido o backups de Supabase, según la guía.
- Sin notificaciones externas, pagos, redes sociales, telemetría de producto o acceso a clientes de póker.

Hoja de ruta: [docs/roadmap.md](docs/roadmap.md).
