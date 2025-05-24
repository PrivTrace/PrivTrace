import type { ObjectId, Document } from "mongodb";

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
