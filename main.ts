import { router } from "./api/route.ts";

const PORT = Deno.env.get("PORT") || 4242;

Deno.serve({ port: PORT }, router);

export {}