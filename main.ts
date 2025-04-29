const kv = await Deno.openKv();

Deno.serve({ port: 4242 }, async (req) => {
  console.log("Method:", req.method);

  switch (req.method) {
    case 'GET':
      return await handleGET(req);
    case 'POST':
      return await handlePOST(req);
  }
 
  const url = new URL(req.url);
  console.log("Path:", url.pathname);
  console.log("Query parameters:", url.searchParams);

  console.log("Headers:", req.headers);

  if (req.body) {
    const body = await req.json();
    console.log("Body:", body);
  }


  return new Response("Hello, World!");
});

async function handleGET(req) {
  const url = new URL(req.url);
  console.log("Path:", url.pathname);

  if (url.pathname === '/api/store') {
    console.log('store match');
    const records = kv.list({ prefix: ["store"] });
    const players: any = [];
    for await (const res of records) {
      players.push(res.value);
    }
    console.log(players);
    
    const response = new Response(JSON.stringify(players), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  
    return response;
  }

  return new Response("invalide store!");

}

async function handlePOST(req) {
  const kv = await Deno.openKv();
  const body = await req.json();

  await kv.set(["store", body.id], body);

  const response = new Response(JSON.stringify({ msg: 'ok'}), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });

  return response;
}


export {}