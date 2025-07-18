import { http200, http400, send } from "../utils/response.ts";
import { logger } from "../utils/logger.ts";
import { headers } from "../utils/constants.ts";
import { printGsat } from "./scripts/gsat.ts";
import { neon } from '@neon/serverless';
const databaseUrl = Deno.env.get('DATABASE_URL')!;
const sql = neon(databaseUrl);


const RATE_LIMIT = 30; // Max requests
const WINDOW_MS = 60_000; // 1 hr minute
// const PENALTY_MS = 60 * 60_000; // Lockout window (1 hour)


function getIP(req: Request): string {
  return req.headers.get("x-forwarded-for") || "unknown";
}

const dbUrl = Deno.env.get("DATABASE_URL");
if (!dbUrl) {
  console.error("DATABASE_URL environment variable is not set");
  Deno.exit(1);
}

const kv = await Deno.openKv();
const secret = Deno.env.get("API_KEY");
const secretv2 = Deno.env.get("API_KEY_SECRET");

async function isRateLimited(ip: string): Promise<boolean> {
  const key = ["rate_limit", ip];
  const now = Date.now();

  const entry = await kv.get<typeof kv>(key);

  if (!entry.value) {
    await kv.set(key, { count: 1, resetTime: now + WINDOW_MS }, { expireIn: WINDOW_MS });
    return false;
  }

  const { count, resetTime } = entry.value as { count: number; resetTime: number };

  if (now > resetTime) {
    await kv.set(key, { count: 1, resetTime: now + WINDOW_MS }, { expireIn: WINDOW_MS });
    return false;
  }

  if (count >= RATE_LIMIT) {
    return true;
  }

  await kv.set(key, { count: count + 1, resetTime }, { expireIn: resetTime - now });
  return false;
}

// Route handler
export const router = async (req: any) => {
  // const ip = getIP(req);

  // if (await isRateLimited(ip)) {
  //   return new Response("Too Many Requests. This API is rate limited!", {
  //     status: 429,
  //     headers: {
  //       "Retry-After": `${Math.ceil(WINDOW_MS / 1000)}`,
  //     },
  //   });
  // }

  const url = new URL(req.url);
  // CORS headers

   // Handle preflight request
   if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: new Headers(headers) });
   }

  const apiKey = url.searchParams.get('key');

  logger(req.method, req.url);

  const [_, prefix, routeName, param] = url.pathname.split('/');
  
  if (!routeName || routeName.trim() === '') {
    return http200({ msg: 'blockstore api 👋' });
  }

  if (!['api'].includes(prefix)) {
    return http400({ msg: 'path not supported' });
  }

  if (apiKey !== secret) {
    return http400({ msg: 'invalid api key' });
  }

  if (req.method === 'DELETE' && apiKey !== secretv2) {
    return http400({ msg: 'invalid api key for delete operation' });
  }

  switch (req.method) {
    case 'GET':
      return await handleGET(req, routeName, param);
    case 'POST':
      return await handlePOST(req, routeName);
    case 'PUT':
      return await handlePUT(req, routeName, param);
    case 'DELETE':
      return await handleDELETE(req, routeName, param);
  }

  return new Response("Not Found", { status: 404, headers: new Headers(headers) });
}

// Insert new reocrd
async function handlePOST(req: Request, routeName: string) {
  const body = await req.json();

  if (!body || !body.id) {
    return http400({ msg: 'invalid request body, id is required' });
  }

  await kv.set([routeName, body.id], body);

  return http200({ msg: 'ok' });
}

// Get all records
async function dbGET(req) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page');

    const pageNumber = page ? Number(page) : 1; 

    const perPage = 20;

    const data = await sql.query(`SELECT * FROM wallets where isverified = 1 limit ${perPage} OFFSET ${(pageNumber  - 1) * perPage}`);
    const total = await sql.query(`SELECT count(*) FROM wallets where isverified = 1`);

    const formatted = printGsat(data, total[0].count, perPage, pageNumber);
  
    return send(formatted);
  } catch (e) {
    console.log('db error:', e);
    return send([]);
  }
}
async function handleGET(req: Request, routeName: string, param: string) {
  if (routeName === 'goldensat') {
    return dbGET(req);
  }
  // get one
  if (param) {
    const item = await kv.get([routeName, param]);
    return http200(item);
  }
  
  const records = kv.list({ prefix: [routeName] });
  const items: any = [];

  for await (const res of records) {
    items.push(res.value);
  }

  if (routeName === 'goldensat') {
    const formatted = printGsat(items);

    return send(formatted);
  }

  return http200(items);
}

// Deletes a record
async function handleDELETE(req: Request, routeName: string, param: string) {
  try {
    const key = [routeName, param].filter(e => e);
    
    await kv.delete(key);
    
    return http200({ msg: 'deleted successfully' });
  } catch (error) {
    return http400({ msg: 'failed to delete resource', error: error.message });
  }
}

// Updates a record
async function handlePUT(req: Request, routeName: string, param: string) {
  try {
    const body = await req.json();

    if (!body || !body.id) {
      return http400({ msg: 'invalid request body, id is required' });
    }
    
    await kv.set([routeName, body.id], body);
    
    return http200({ msg: 'updated successfully' });
  } catch (error) {
    return http400({ msg: 'failed to update resource', error: error.message });
  }
}
