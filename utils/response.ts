export const http200 = (json: any) => {
  const response = new Response(JSON.stringify(json), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });

  return response;
}

export const http400 = (json: any) => {
  const response = new Response(JSON.stringify(json), {
    status: 400,
    headers: {
      "content-type": "application/json",
    },
  });

  return response;
}