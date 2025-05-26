const headers = {
  "content-type": "application/json",
};

const res = (status, json) => new Response(JSON.stringify(json), {
  status: status,
  headers
});

export const http200 = (json: any) => res(200, json);

export const http400 = (json: any) => res(400, json);