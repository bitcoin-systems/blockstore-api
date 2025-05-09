import { http200, http400 } from "../utils/response.ts";

const kv = await Deno.openKv();
const secret = Deno.env.get("API_KEY");

export const router = async (req: any) => {
  const url = new URL(req.url);
  const apiKey = url.searchParams.get('key');

  const [_, prefix, routeName] = url.pathname.split('/');
  
  if (!routeName || routeName.trim() === '') {
    return http400({ msg: 'invalid route name' });
  }

  if (!['api'].includes(prefix)) {
    return http400({ msg: 'path not supported' });
  }

  if (apiKey !== secret) {
    return http400({ msg: 'invalid api key' });
  }

  switch (req.method) {
    case 'GET':
      return await handleGET(req, routeName);
    case 'POST':
      return await handlePOST(req, routeName);
  }
}

async function handlePOST(req: Request, routeName: string) {
  const body = await req.json();

  if (!body || !body.id) {
    return http400({ msg: 'invalid request body, id is required' });
  }

  await kv.set([routeName, body.id], body);

  return http200({ msg: 'ok' });
}

async function handleGET(req: Request, routeName: string) {
  const records = kv.list({ prefix: [routeName] });
  const items: any = [];

  for await (const res of records) {
    items.push(res.value);
  }

  return http200(items);
}
