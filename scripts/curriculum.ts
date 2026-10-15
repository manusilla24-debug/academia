import { mutate } from "../src/lib/db/store";
import { installCurriculum } from "../src/lib/curriculum";
console.log(
  (await mutate(installCurriculum))
    ? "Ruta editorial actualizada: 24 clases, 48 ejercicios y 24 fichas. Ediciones personales conservadas."
    : "La ruta ya existe; se han conservado tus ediciones.",
);
