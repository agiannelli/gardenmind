import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    // Protect: /planner, /journal, /calendar, /ai-advisor
    "/(planner|journal|calendar|ai-advisor)(.*)",
  ],
};
