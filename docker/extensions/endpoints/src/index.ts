import { defineEndpoint } from "@directus/extensions-sdk";

export default defineEndpoint((router) => {
  router.post("/", (_req, res) => res.json({ message: "Hello, World!.-.." }));
});
