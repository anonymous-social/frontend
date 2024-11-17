export async function GET() {
  const res = await fetch("http://localhost:8080/api/publicKey");
  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: res.headers,
  });
}
