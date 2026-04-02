import { handleAuth } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

// Gracefully handle missing Auth0 configuration until PR #2
const isAuth0Configured = Boolean(
  process.env.AUTH0_SECRET &&
  process.env.AUTH0_ISSUER_BASE_URL &&
  process.env.AUTH0_CLIENT_ID &&
  process.env.AUTH0_CLIENT_SECRET
);

export async function GET(
  request: Request,
  context: { params: Promise<{ auth0: string }> }
) {
  if (!isAuth0Configured) {
    return NextResponse.json(
      { error: "Auth0 not configured" },
      { status: 503 }
    );
  }

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
