import axios from "axios";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get("unit");
    const projectId = process.env.BLOCKFROST_PROJECT_ID as string;
    const response = await axios.get(`https://cardano-${projectId.slice(0, 7)}.blockfrost.io/api/v0/assets/` + unit, {
      headers: {
        Project_id: projectId,
      },
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return Response.json(response.data, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
