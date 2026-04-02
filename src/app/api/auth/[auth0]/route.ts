import { handleAuth } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ auth0: string }> }
) {
  const { auth0 } = await context.params;

  try {
    const handler = handleAuth();
    return handler(request, { params: { auth0 } });
  } catch (error) {
    console.error("Auth handler error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}
