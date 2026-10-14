import { mutate } from "../src/lib/db/store";
import { seedDemo } from "../src/lib/demo";
console.log(
  (await mutate(seedDemo))
    ? "Demo añadido."
    : "Demo ya existente; datos conservados.",
);
