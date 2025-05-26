import type { NextRequest } from "next/server";
import { createAuditLog, extractAuditContext } from "./audit-logger";
import type { Session } from "./auth";

/**
 * Logs user authentication events manually
 * Call this after successful login operations
 */
export async function logUserLogin(session: Session, request: NextRequest) {
    try {
        const auditContext = extractAuditContext(request, session);

        await createAuditLog({
            action: "USER_LOGIN",
            resourceType: "SESSION",
            resourceId: session.session.id,
            metadata: {
                userEmail: session.user.email,
                userName: session.user.name,
                description: `User ${session.user.name} logged in`,
            },
            context: auditContext,
        });
    } catch (error) {
        console.error("Failed to log user login:", error);
    }
}

/**
 * Logs user logout events
 * Call this before destroying the session
 */
export async function logUserLogout(session: Session, request: NextRequest) {
    try {
        const auditContext = extractAuditContext(request, session);

        await createAuditLog({
            action: "USER_LOGOUT",
            resourceType: "SESSION",
            resourceId: session.session.id,
            metadata: {
                userEmail: session.user.email,
                userName: session.user.name,
                description: `User ${session.user.name} logged out`,
            },
            context: auditContext,
        });
    } catch (error) {
        console.error("Failed to log user logout:", error);
    }
}

/**
 * Logs user registration events
 * Call this after successful user creation
 */
export async function logUserRegistration(
    user: { id: string; email: string; name: string },
    request: NextRequest,
) {
    try {
        const auditContext = extractAuditContext(request);

        await createAuditLog({
            action: "USER_REGISTER",
            resourceType: "USER",
            resourceId: user.id,
            metadata: {
                userEmail: user.email,
                userName: user.name,
                description: `User ${user.name} registered`,
            },
            context: {
                ...auditContext,
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
            },
        });
    } catch (error) {
        console.error("Failed to log user registration:", error);
    }
}

/**
 * Logs password change events
 */
export async function logPasswordChange(
    session: Session,
    request: NextRequest,
) {
    try {
        const auditContext = extractAuditContext(request, session);

        await createAuditLog({
            action: "USER_PASSWORD_CHANGE",
            resourceType: "USER",
            resourceId: session.user.id,
            metadata: {
                userEmail: session.user.email,
                userName: session.user.name,
                description: `User ${session.user.name} changed password`,
            },
            context: auditContext,
        });
    } catch (error) {
        console.error("Failed to log password change:", error);
    }
}
