Deno.serve({ port: 4242 }, async (req) => {

  console.log("Method:", req.method);

  switch (req.method) {
    case 'GET':
      return await handleGET(req);
    case 'POST':
      // return await handlePOST(req);
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
    return new Response("store!");
  }

  return new Response("invalide store!");

}
