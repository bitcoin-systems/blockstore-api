import { router } from "./api/route.ts";

Deno.serve({ port: 4242 }, router);

export {}