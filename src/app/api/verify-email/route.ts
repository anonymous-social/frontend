export async function POST(request: Request) {
  const { encryptedEmail, address } = await request.json();

  // Send to our TEE backend
  const response = await fetch("http://localhost:8080/api/verifyEmail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ encryptedEmail, address }),
  });

  const json = await response.json();
  return new Response(JSON.stringify(json));
}
