import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.AUTH_DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'client', // Defaults social/Google login to 'client'
        input: true,
      },
      skills: {
        type: 'string',
        defaultValue: '', // Left empty/blank for standard clients
        input: true,
      },
      bio: {
        type: 'string',
        defaultValue: '', // Left empty/blank for standard clients
        input: true,
      },
      hourlyRate: {
        type: 'number',
        defaultValue: 0, // 0 or empty for standard clients
        input: true,
      },
      isBlocked: {
        type: 'boolean',
        defaultValue: false,
        input: false, // Keep false so users cannot block/unblock themselves
      },
    },
  }
});