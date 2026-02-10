import swaggerUi from "swagger-ui-express";
import fs from "fs";

const swaggerFile = JSON.parse(
  fs.readFileSync("./swagger-output.json", "utf8"),
);

export { swaggerFile as specs, swaggerUi };
