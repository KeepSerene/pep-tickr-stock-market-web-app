import { inngest } from "@/lib/inngest/client";
import { sendDailyNewsSummary, sendSignUpEmail } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves inngest functions
// ROUTE: /api/inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});

/*
1. User submits form
   ↓
2. signUpAction() runs
   ↓
3. inngest.send() is called (in auth.actions.ts)
   ↓
4. Event sent to Inngest Cloud (external service)
   ↓
5. Inngest Cloud processes event
   ↓
6. Inngest makes HTTP request BACK to OUR app
   at /api/inngest (webhook)
   ↓
7. serve() handlers receive the request
   ↓
8. inngest functions execute
*/
