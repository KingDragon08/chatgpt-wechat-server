export async function gen(ctx) {
  const { keyword } = ctx.request.body;
  const result = await fetch(
    'https://api.openai.com/v1/images/generations',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: keyword,
        n: 1,
        size: '256x256'
      }),
    }
  );
  if (!result.ok) {
    ctx.body = { error: 'model error' };
    ctx.status = 500;
  } else {
    ctx.body = await result.json();
    ctx.status = 200;
  }
}
