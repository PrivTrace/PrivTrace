import type {
    AuditAction,
    AuditLogDocument,
    AuditMetadata,
    ResourceType
} from "@/types/database";
import { ObjectId } from "mongodb";
import type { Session } from "./auth";
import { getDb } from "./mongodb";

export interface AuditLogContext {
    userId?: string;
    userEmail?: string;
    userName?: string;
    companyId?: ObjectId | string;
    ipAddress?: string;
    userAgent?: string;
    session?: Session;
}

export interface CreateAuditLogParams {
    action: AuditAction;
    resourceType: ResourceType;
    resourceId: ObjectId | string;
    metadata?: AuditMetadata;
    context?: AuditLogContext;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog({
    action,
    resourceType,
    resourceId,
    metadata = {},
    context = {}
}: CreateAuditLogParams): Promise<ObjectId> {
    try {
        const db = await getDb();
        const auditLog: Omit<AuditLogDocument, "_id"> = {
            action,
            resourceType,
            resourceId,
            userId: context.userId || context.session?.session.userId,
            userEmail: context.userEmail || context.session?.user?.email,
            userName: context.userName || context.session?.user?.name,
            companyId: typeof context.companyId === "string"
                ? new ObjectId(context.companyId)
                : context.companyId,
            metadata: {
                ...metadata,
                severity: metadata.severity || getSeverityForAction(action)
            },
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            timestamp: new Date()
        };

        const result = await db
            .collection<Omit<AuditLogDocument, "_id">>("auditLogs")
            .insertOne(auditLog);

        return result.insertedId;
    } catch (error) {
        // Log the error but don't throw to avoid breaking the main operation
        console.error("Failed to create audit log:", error);
        throw error;
    }
}

/**
 * Retrieves audit logs with filtering and pagination
 */
export async function getAuditLogs(options: {
    companyId?: ObjectId | string;
    userId?: string;
    resourceType?: ResourceType;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
    sortBy?: "timestamp" | "action" | "resourceType";
    sortOrder?: "asc" | "desc";
} = {}) {
    const db = await getDb();

    const filter: any = {};

    if (options.companyId) {
        filter.companyId = typeof options.companyId === "string"
            ? new ObjectId(options.companyId)
            : options.companyId;
    }

    if (options.userId) {
        filter.userId = options.userId;
    }

    if (options.resourceType) {
        filter.resourceType = options.resourceType;
    }

    if (options.action) {
        filter.action = options.action;
    }

    if (options.startDate || options.endDate) {
        filter.timestamp = {};
        if (options.startDate) {
            filter.timestamp.$gte = options.startDate;
        }
        if (options.endDate) {
            filter.timestamp.$lte = options.endDate;
        }
    }

    const sortField = options.sortBy || "timestamp";
    const sortDirection = options.sortOrder === "asc" ? 1 : -1;

    const cursor = db
        .collection<AuditLogDocument>("auditLogs")
        .find(filter)
        .sort({ [sortField]: sortDirection });

    if (options.skip) {
        cursor.skip(options.skip);
    }

    if (options.limit) {
        cursor.limit(options.limit);
    }

    const logs = await cursor.toArray();
    const total = await db.collection("auditLogs").countDocuments(filter);

    return {
        logs,
        total,
        hasMore: (options.skip || 0) + logs.length < total
    };
}

/**
 * Gets audit logs for a specific resource
 */
export async function getResourceAuditLogs(
    resourceType: ResourceType,
    resourceId: ObjectId | string,
    options: {
        limit?: number;
        skip?: number;
    } = {}
) {
    return getAuditLogs({
        resourceType,
        ...options,
        // Add resourceId filter - we'll need to handle this in the getAuditLogs function
    });
}

/**
 * Determines severity level based on action type
 */
function getSeverityForAction(action: AuditAction): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const criticalActions: AuditAction[] = [
        "COMPANY_DELETE",
        "DSR_DELETE",
        "ADMIN_ROLE_CHANGE",
        "DATA_EXPORT"
    ];

    const highActions: AuditAction[] = [
        "USER_PASSWORD_CHANGE",
        "COMPANY_UPDATE",
        "DSR_STATUS_CHANGE",
        "ADMIN_ACCESS_GRANTED"
    ];

    const mediumActions: AuditAction[] = [
        "COMPANY_CREATE",
        "DSR_CREATE",
        "DSR_UPDATE",
        "USER_REGISTER",
        "DSR_NOTE_ADD"
    ];

    if (criticalActions.includes(action)) return "CRITICAL";
    if (highActions.includes(action)) return "HIGH";
    if (mediumActions.includes(action)) return "MEDIUM";

    return "LOW";
}

/**
 * Utility function to extract context from Next.js request
 */
export function extractAuditContext(
    request: Request,
    session?: Session
): AuditLogContext {
    const { headers } = request;

    return {
        session,
        ipAddress: headers.get("x-forwarded-for") ||
            headers.get("x-real-ip") ||
            headers.get("cf-connecting-ip") ||
            "unknown",
        userAgent: headers.get("user-agent") || "unknown"
    };
}

/**
 * Wrapper function for DSR operations with automatic audit logging
 */
export async function auditedOperation<T>(
    operation: () => Promise<T>,
    auditParams: CreateAuditLogParams
): Promise<T> {
    try {
        const result = await operation();
        await createAuditLog(auditParams);
        return result;
    } catch (error) {
        // Log the failed operation
        await createAuditLog({
            ...auditParams,
            metadata: {
                ...auditParams.metadata,
                error: error instanceof Error ? error.message : "Unknown error",
                success: false
            }
        });
        throw error;
    }
}
