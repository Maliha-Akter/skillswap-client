import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware, APIError } from "better-auth/api"; // 👈 Import these helpers

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.AUTH_DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check if a login/session generation endpoint just ran successfully
      const session = ctx.context.newSession;
      
      // Intercept if the authenticated user has the blocked flag active
      if (session && session.user && session.user.isBlocked === true) {
        throw new APIError("UNAUTHORIZED", {
          message: "Your account has been suspended by an administrator.",
        });
      }
    }),
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'client',
        input: true,
      },
      skills: {
        type: 'string',
        defaultValue: '',
        input: true,
      },
      bio: {
        type: 'string',
        defaultValue: '',
        input: true,
      },
      hourlyRate: {
        type: 'number',
        defaultValue: 0,
        input: true,
      },
      isBlocked: {
        type: 'boolean',
        defaultValue: false,
        input: false, // Prevents manipulation from the client payload during signup
      },
    },
  }
});