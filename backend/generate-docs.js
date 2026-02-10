import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Admin API",
    description: "Admin API Documentation",
  },
  host: "localhost:5000",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "authorization",
      description: "Enter JWT token as: Bearer <token>",
    },
  },
  security: [{ bearerAuth: [] }],
};

const outputFile = "./swagger-output.json";
const routes = ["./index.js"];

swaggerAutogen(outputFile, routes, doc);
