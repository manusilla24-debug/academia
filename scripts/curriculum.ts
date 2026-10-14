import { mutate } from "../src/lib/db/store";
import { installCurriculum } from "../src/lib/curriculum";
console.log(
  (await mutate(installCurriculum))
    ? "Ruta editorial instalada: 18 lecciones, 36 ejercicios y 18 fichas. No atribuida al canal."
    : "La ruta ya existe; se han conservado tus ediciones.",
);
