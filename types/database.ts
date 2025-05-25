import type { Document, ObjectId } from "mongodb";

export interface CompanyDocument extends Document {
    _id: ObjectId;
    name: string;
    adminUserId: string;
    dsrFormIdentifier: string;
    adminEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface InternalNote {
    note: string;
    adminUserId: string;
    timestamp: Date;
}

export interface DSRRequestDocument extends Document {
    _id: ObjectId;
    companyId: ObjectId;
    requesterEmail: string;
    requesterName: string;
    requestType: "ACCESS" | "DELETE" | "CORRECT" | "OTHER";
    details?: string;
    status:
    | "NEW"
    | "PENDING_VERIFICATION"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED";
    internalNotes: InternalNote[];
    createdAt: Date;
    updatedAt: Date;
    acknowledgedAt?: Date;
    completedAt?: Date;
}

export interface CreateDSRRequest {
    companyIdentifier: string;
    requesterEmail: string;
    requesterName: string;
    requestType: "ACCESS" | "DELETE" | "CORRECT" | "OTHER";
    details?: string;
}

export interface UpdateDSRRequest {
    status?: DSRRequestDocument["status"];
    internalNotes?: InternalNote[];
    acknowledgedAt?: Date;
    completedAt?: Date;
}

// Audit Log Types
export interface AuditLogDocument extends Document {
    _id: ObjectId;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId: ObjectId | string;
    userId?: string; // Can be null for public actions
    userEmail?: string;
    userName?: string;
    companyId?: ObjectId;
    metadata: AuditMetadata;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

export type AuditAction =
    // User actions
    | "USER_LOGIN"
    | "USER_LOGOUT"
    | "USER_REGISTER"
    | "USER_PASSWORD_CHANGE"
    | "USER_EMAIL_VERIFY"
    // Company actions
    | "COMPANY_CREATE"
    | "COMPANY_UPDATE"
    | "COMPANY_DELETE"
    // DSR actions
    | "DSR_CREATE"
    | "DSR_UPDATE"
    | "DSR_STATUS_CHANGE"
    | "DSR_DELETE"
    | "DSR_NOTE_ADD"
    | "DSR_VIEW"
    // Admin actions
    | "ADMIN_LOGIN"
    | "ADMIN_ACCESS_GRANTED"
    | "ADMIN_ROLE_CHANGE"
    // System actions
    | "SYSTEM_BACKUP"
    | "SYSTEM_MAINTENANCE"
    | "DATA_EXPORT"
    | "DATA_IMPORT";

export type ResourceType =
    | "USER"
    | "COMPANY"
    | "DSR_REQUEST"
    | "AUDIT_LOG"
    | "SYSTEM"
    | "SESSION";

export interface AuditMetadata {
    [key: string]: any;
    // Common fields
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changes?: string[];
    // DSR specific
    dsrStatus?: string;
    requestType?: string;
    // User specific
    role?: string;
    // Company specific
    companyName?: string;
    // Additional context
    description?: string;
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

    completedAt?: Date;
}
