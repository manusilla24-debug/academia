# Verificación

14 de octubre de 2026. Windows, Node 24.15.0, Next.js 16.4.1, lockfile versionado.

Resultados ejecutados sobre el código final:

| Comando                | Resultado                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm run typecheck`    | Sin errores                                                                           |
| `npm run lint`         | Sin errores ni advertencias                                                           |
| `npm test`             | 37 pruebas, 9 archivos, todas pasan                                                   |
| `npm run build`        | Compilación de producción correcta; páginas privadas dinámicas                        |
| `npm run test:e2e`     | 2 recorridos aprobados: login con contraseña y estudio con worker real                |
| `npm audit --omit=dev` | 0 vulnerabilidades conocidas de producción                                            |
| `npm run seed`         | Ejecutado; tres lecciones, cinco ejercicios, una mano y un leak DEMO en la base local |
| `git diff --check`     | Sin errores de whitespace                                                             |

La prueba de navegador verifica revisión explícita de ejercicios, persistencia de notas/progreso/intentos, exportación, creación de una mano desde campos y ausencia de desbordamiento a 390 px. PGlite aplica el SQL y las políticas, comprueba FKs y que otro UUID no pueda consultar/escribir los datos. El pipeline prueba reanudación tras fallo y caché de bloques idénticos sin repetir llamadas de proveedor.

Vitest ejecuta tests unitarios/de integración; PGlite verifica migraciones, FKs, índice y RLS; Chromium verifica Next, worker y persistencia reales. Las pruebas de proveedores usan respuestas controladas. No hay credenciales reales de YouTube/IA/Supabase: no se afirma conexión remota ni se ha desplegado/facturado IA.

Dependencias: esbuild se corrigió con override de desarrollo de Drizzle Kit. Sigue el aviso `braces` ≤3.0.3, transitivo de ESLint/Next y sin versión parcheada publicada al consultar el registro. Afecta a patrones glob profundamente anidados; la app no recibe globs de usuarios. Se audita producción por separado. `npm audit fix --force` propone retroceder ESLint Next a otra versión mayor, por lo que no se aplica a ciegas.

Las capturas QA reflejan la aplicación con DEMO etiquetado y fixture de prueba; no son mockups ni prueba de acceso al canal real. Se comprueba móvil de 390 px. Quedan por verificar navegadores/dispositivos adicionales y servicios remotos con credenciales del propietario.

## Ampliación de contenido y diseño

El servidor de desarrollo usa Webpack e ignora la base local y las cachés de compilación para evitar recargas al persistir datos. Se repitieron ambos recorridos E2E con esta configuración y la compilación de producción pasó en una caché independiente. El acceso permite hasta 30 segundos de compilación inicial en la prueba; se mantiene la comprobación de cierre de sesión y respuesta 401.

Portada simplificada basada en primitivas MIT de shadcn/ui, con atribución. Ruta editorial de 18 lecciones, 36 ejercicios y 18 fichas. Catálogo local de 65 vídeos reales, 8 transcripciones legítimas obtenidas mediante la integración de navegador y 6 síntesis con referencias. Hay 8 ejercicios derivados pendientes de revisión. RSS oficial consultado realmente; no se ha supuesto acceso al histórico completo.

Se verificó el login real con la contraseña solicitada y se corrigió el envío de email nulo en modo local. La configuración privada usa hash scrypt con salt y desactiva la entrada DEMO. Las transcripciones, la base SQLite y las credenciales quedan ignoradas por Git. No se afirma que todo el canal esté procesado o que se garanticen resultados de NL10.
