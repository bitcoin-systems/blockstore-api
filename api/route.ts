import { http200, http400, send } from "../utils/response.ts";
import { logger } from "../utils/logger.ts";
import { headers } from "../utils/constants.ts";
import { printGsat } from "./scripts/gsat.ts";
import { neon } from '@neon/serverless';
const databaseUrl = Deno.env.get('DATABASE_URL')!;
const sql = neon(databaseUrl);

const dbUrl = Deno.env.get("DATABASE_URL");
if (!dbUrl) {
  console.error("DATABASE_URL environment variable is not set");
  Deno.exit(1);
}

const kv = await Deno.openKv();
const secret = Deno.env.get("API_KEY");
const secretv2 = Deno.env.get("API_KEY_SECRET");

// Route handler
export const router = async (req: any) => {
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
async function dbGET() {
  try {
    const data = await sql.query(`SELECT * FROM users where isverified = 'true'`);

    const formatted = printGsat(data);
  
    return send(formatted);
  } catch (e) {
    console.log('db error:', e);
    return send([]);
  }
}
async function handleGET(req: Request, routeName: string, param: string) {
  if (routeName === 'goldensat') {
    return dbGET();
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
