import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "./mongodb";

export const auth = betterAuth({
    // @ts-ignore
    database: mongodbAdapter(await getDb()),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 24 hours
    },
    trustedOrigins: ["http://localhost:3000", "https://dev.untraceable.dev"],
});

export type Session = typeof auth.$Infer.Session;
