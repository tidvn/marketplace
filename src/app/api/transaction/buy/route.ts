

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return Response.json(body, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
