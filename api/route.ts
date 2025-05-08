import { http200, http400 } from "../utils/response.ts";

const kv = await Deno.openKv();

export const router = async (req: any) => {
  const url = new URL(req.url);
  const apiKey = url.searchParams.get('key');
  const secret = Deno.env.get("API_KEY");

  console.log('req url:', url);
  if (url.pathname !== '/api/store') {
    return http400({ msg: 'path not supported' });
  }

  if (apiKey !== secret) {
    return http400({ msg: 'invalid api key' });
  }

  switch (req.method) {
    case 'GET':
      return await handleGET(req);
    case 'POST':
      return await handlePOST(req);
  }
}

async function handlePOST(req) {
  const body = await req.json();

  await kv.set(["store", body.id], body);

  return http200({ msg: 'ok' });
}

async function handleGET(req) {
  const records = kv.list({ prefix: ["store"] });
  const items: any = [];

  for await (const res of records) {
    items.push(res.value);
  }

  return http200(items);
}
