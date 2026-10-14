# Arquitectura

`src/app` contiene páginas privadas y endpoints autenticados; Zod valida mutations y se exige mismo origen. `src/components` implementa el shell responsive, las pantallas, la mesa y el editor, con Tailwind, Lucide y diálogos Radix. La configuración shadcn está disponible para extender los componentes.

`src/lib/domain.ts` define contratos y validadores. `db` implementa schema Drizzle, PostgreSQL y SQLite. `transcripts`, `youtube`, `ai` y `source-storage` separan proveedores; solo están conectadas capacidades realmente implementadas. `scripts` contiene worker, importación por manifiesto, sincronización, seed y migraciones.

## Procedencia y persistencia

Video → Transcript → Segment. Conceptos guardan cita literal y IDs de segmentos; `concept_sources` conserva relaciones en PostgreSQL. Lecciones enlazan conceptos/segmentos mediante `lesson_sources` y guardan versiones anteriores. Ejercicios/fichas enlazan fuentes; intentos/progreso/schedules guardan datos observados. Manos y leaks preservan razonamiento, evidencia e incertidumbre.

IDs, FKs, unicidad e índice full-text están normalizados; payload JSONB permite evolución del material de una sola persona. SQLite conserva el agregado en una transacción. El repositorio serializa mutations con BEGIN IMMEDIATE local o advisory lock PostgreSQL, pero todavía carga el agregado completo; debe migrarse a consultas específicas/paginación para miles de fuentes. La UI omite cues/texto íntegro de transcripciones y solicita segmentos completos al abrir sus referencias.

## Worker

Estados queued/running/completed/paused/failed. Reclama lease de 180 segundos bajo lock y renueva antes de cada extracción; timeout externo de 90 segundos. Las llamadas externas nunca mantienen el lock. Conceptos y avance se guardan juntos. Un worker antiguo no puede confirmar si ha perdido el lease/cursor. Pausar deja terminar la llamada en curso; sustituir la fuente pausa trabajos pendientes de versiones anteriores.

Hashes de cues evitan ingestas duplicadas; IDs deterministas y checkpoints evitan duplicación en reanudaciones. Solo se consolidan explicación/cita idénticas, conservando fuentes adicionales. No se detectan contradicciones semánticas ni se inventa un temario independiente del contenido. Las lecciones agrupan conceptos por vídeo, con módulos editables.

Se valida esquema IA y cita literal dentro del segmento enviado. No se aceptan segundos ni IDs de fuentes sugeridos por el modelo. Esto garantiza procedencia literal, no corrección estratégica de toda la interpretación: borradores y ejercicios requieren revisión del propietario.

## Búsqueda y repaso

PostgreSQL usa índice GIN sobre `to_tsvector('spanish',body)`, términos normalizados unidos con OR y `ts_rank`. Local usa ranking léxico. La explicación es contenido almacenado distinguido de fuente original; no se genera una respuesta nueva del canal si faltan fuentes.

SM-2: nota 0–5; ease inicial 2,5, mínimo 1,3; fallo <3 reinicia a un día; éxitos pasan a uno, seis y después `interval × ease`. Ease se actualiza con `0,1 − (5−nota) × (0,08 + (5−nota) × 0,02)`. Fechas UTC. Autoevaluación/errores no se presentan como lectura completada ni dominio demostrado.

El validador de manos comprueba consistencia básica; no es motor de apuestas ni solver. No calcula EV/equity, mínimos de raise, side pots ni rake. La presencia de una clave solo se presenta como configurada, nunca como conexión verificada. No existe acceso a clientes de póker.
