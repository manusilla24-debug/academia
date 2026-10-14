# Despliegue privado

## Supabase

1. Crea el proyecto y desactiva **Allow new users to sign up** en Authentication. Crea el propietario desde el panel con email/password y contraseña robusta. La app no registra usuarios.
2. Copia el UUID del propietario. El servidor verifica `auth.getUser()` y exige coincidencia con `OWNER_USER_ID`.
3. Configura `.env.local`:

   ```dotenv
   APP_MODE=supabase
   LOCAL_DEMO_LOGIN=false
   NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
   OWNER_USER_ID=UUID_REAL
   DATABASE_URL=URL_DEL_POOLER_CON_TLS
   ```

   Usa la URL de pooler proporcionada por tu panel. El driver exige TLS y desactiva prepared statements. Nunca pongas `NEXT_PUBLIC_` a DATABASE_URL. Storage usa la sesión del propietario: no necesita una service role key.

4. Ejecuta `npm run db:migrate`. El journal Drizzle evita repetir la migración inicial; las políticas RLS/Storage son idempotentes. No hay reset ni borrado de datos.
5. Inserta el propietario administrativamente en el editor SQL:

   ```sql
   INSERT INTO public.app_owner (id, user_id)
   VALUES (true, 'UUID_REAL_DEL_PROPIETARIO');
   ```

   La tabla permite una única fila y referencia `auth.users`. Si ya existe, compruébala antes de cambiarla. Debe coincidir con `OWNER_USER_ID`.

6. El bucket `transcripts` es privado, permite texto hasta 8 MB y limita lectura/inserción a la carpeta del propietario. TXT/SRT/VTT se suben como `text/plain` original con nombre hash. No se almacenan vídeos.
7. Prueba login, subida, lectura de fuentes, RLS y worker con tu proyecto. No se verificaron conexiones remotas en esta entrega por falta de credenciales.

El backend/CLI usa una conexión PostgreSQL privilegiada, disponible solo en servidor y detrás de guards de propietario. RLS protege acceso directo con la clave pública. Esta arquitectura es de propietario único; una futura versión multiusuario necesita tenancy explícita y conexión ligada al usuario.

## GitHub

El Git local y el remote `origin` ya existían: `https://github.com/manusilla24-debug/academia.git`. Se ha verificado que el repositorio es público y la cuenta dispone de escritura; la publicación solicitada excluye datos privados, claves y transcripciones. `.env.local`, datos, dependencias y QA están ignorados. Revisa el diff y confirma que tu repositorio es **privado**:

```powershell
git status
git add .
git commit -m "Implement Poker Study Lab"
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin HEAD
```

Sustituye la URL; no repitas `remote add` si ya existe. Comprueba que no haya secretos antes del commit.

## Vercel

### Acceso solo con contraseña

El almacenamiento y la autenticación se configuran por separado. Para una academia privada con una contraseña compartida, configura en Vercel (Production):

```dotenv
APP_MODE=supabase
AUTH_MODE=password
LOCAL_DEMO_LOGIN=false
LOCAL_PASSWORD_HASH=SALT:DIGEST_SCRYPT
LOCAL_PASSWORD_MIN_LENGTH=7
SESSION_SECRET=VALOR_ALEATORIO_DE_AL_MENOS_32_CARACTERES
DATABASE_URL=URL_POSTGRESQL_CON_TLS
APP_ORIGIN=https://TU_DOMINIO
```

Usa el hash y el secreto privados, nunca los publiques en Git ni uses prefijos `NEXT_PUBLIC_`. La contraseña no se incluye en el código. Este modo muestra únicamente el campo de contraseña y usa una cookie HTTPS, HttpOnly y SameSite Strict con duración de ocho horas. No requiere email ni una sesión de Supabase Auth. Los originales de las transcripciones se conservan en la fila PostgreSQL junto con sus cues; este modo no necesita Supabase Storage.

La base PostgreSQL y sus migraciones siguen siendo necesarias. El contenido SQLite del ordenador no se transfiere a Vercel con un push. Cambiar variables requiere un nuevo despliegue. Sin `AUTH_MODE=password`, se mantiene el acceso con email y contraseña de Supabase descrito abajo.

1. Importa el repositorio privado. Framework Next.js, raíz este directorio, instalación `npm ci`, build `npm run build`, Node 24 o 22.
2. Configura variables Supabase, `APP_MODE=supabase`, y claves de YouTube/IA si quieres esos servicios. SQLite se rechaza en Vercel porque no sería persistente.
3. Añade `NEXT_TELEMETRY_DISABLED=1` para desactivar telemetría del CLI. No hay telemetría de producto.
4. Configura `APP_ORIGIN=https://TU_DOMINIO` sin barra final. En Preview usa el origen exacto del preview o déjalo vacío. El guard comprueba Origin contra el host real si no hay origen fijo.
5. Configura también Site URL/URLs autorizadas en Supabase y despliega. No se necesita cron ni `vercel.json`; las peticiones normales nunca procesan vídeos largos.
6. Verifica que `/` y todas las APIs de datos/fuentes/búsqueda/exportación exigen sesión y que un UUID distinto del propietario se rechaza.
7. Ejecuta `npm run worker` desde un equipo/servicio confiable, con el mismo código, `DATABASE_URL`, `APP_MODE=supabase` y variables IA. La app refresca estado cada diez segundos.

Vercel impone su propio límite de cuerpo HTTP (habitualmente alrededor de 4,5 MB). El límite local de la app de 8 MB no lo amplía: usa el CLI para archivos grandes. No se ha iniciado un despliegue ni facturación externa.

## Backups

- Local: detén servidor/worker y copia `data/` completo, incluidos WAL/SHM si existen. Copiar solo `.db` con WAL activo no es un backup seguro. Con procesos activos utiliza una herramienta de backup SQLite.
- Supabase: configura backups/recuperación conforme a tu plan, y respalda PostgreSQL y Storage por separado.
- JSON exportado es legible y portátil, pero aún no tiene restauración integral automática. Fuentes normalizadas/cues/materiales/progreso forman parte del JSON; originales subidos están en `data/sources` o Storage privado.

## Diagnóstico

| Síntoma                        | Comprobar                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Login local falla              | Contraseña ≥12, SESSION_SECRET ≥32, APP_MODE correcto; reiniciar al cambiar variables. |
| HTTP 403 al guardar            | APP_ORIGIN, protocolo, dominio y puerto.                                               |
| Supabase rechaza propietario   | Credenciales y coincidencia entre UUID real, OWNER_USER_ID y app_owner.                |
| Worker no crea lecciones       | Misma DB y APP_MODE que el servidor; job con transcripción/relevancia válidas.         |
| Job running tras cerrar CLI    | Lease de tres minutos; otro worker retoma al caducar.                                  |
| Pausa tarda en liberarse       | La llamada externa en curso puede terminar antes del checkpoint.                       |
| Presupuesto agotado tras fallo | Las reservas cuentan; comprueba facturación antes de ajustarlas administrativamente.   |
| YouTube 403                    | Cuota, API habilitada y restricciones de key; importación manual sigue disponible.     |
| Storage falla                  | Bucket/políticas/migraciones y carpeta del UUID propietario.                           |
| Tablas ausentes                | Ejecuta migraciones contra la misma URL, sin reset.                                    |
| EPERM al compilar              | Autoriza procesos hijos webpack/esbuild en el entorno, sin simular compilaciones.      |
