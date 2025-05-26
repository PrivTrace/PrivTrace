import { createAuditLog, extractAuditContext } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import { decryptDSRData } from "@/lib/encryption";
import { getDb } from "@/lib/mongodb";
import type {
    CompanyDocument,
    DSRRequestDocument,
    UpdateDSRRequest,
} from "@/types/database";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

// GET - Get specific DSR
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ dsrId: string }> },
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { dsrId } = await params;

        if (!ObjectId.isValid(dsrId)) {
            return NextResponse.json(
                { error: "Invalid DSR ID" },
                { status: 400 },
            );
        }

        const db = await getDb();

        // Find company for the authenticated user
        const company = await db
            .collection<CompanyDocument>("companies")
            .findOne({ adminUserId: session.session.userId });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 },
            );
        }

        // Find DSR and ensure it belongs to the user's company
        const encryptedDsrRequest = await db
            .collection<DSRRequestDocument>("dsrRequests")
            .findOne({
                _id: new ObjectId(dsrId),
                companyId: company._id,
            });

        if (!encryptedDsrRequest) {
            return NextResponse.json(
                { error: "DSR not found" },
                { status: 404 },
            );
        }
        
        // Decrypt sensitive data
        const decrypted = decryptDSRData({
            requesterEmail: encryptedDsrRequest.requesterEmail,
            requesterName: encryptedDsrRequest.requesterName,
            requestType: encryptedDsrRequest.requestType,
            details: encryptedDsrRequest.details,
        });
        
        // Create a copy with decrypted values
        const dsrRequest = { 
            ...encryptedDsrRequest,
            requesterEmail: decrypted.requesterEmail,
            requesterName: decrypted.requesterName,
            requestType: decrypted.requestType as any,
            details: decrypted.details,
        };

        // Log DSR view
        const auditContext = extractAuditContext(request, session);
        await createAuditLog({
            action: "DSR_VIEW",
            resourceType: "DSR_REQUEST",
            resourceId: dsrId,
            metadata: {
                requestType: dsrRequest.requestType,
                status: dsrRequest.status,
                description: `DSR viewed by ${session.user.name}`,
            },
            context: {
                ...auditContext,
                companyId: company._id,
            },
        });

        return NextResponse.json(dsrRequest);
    } catch (error) {
        console.error("Error fetching DSR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// PUT - Update DSR
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ dsrId: string }> },
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { dsrId } = await params;
        const updates: UpdateDSRRequest = await request.json();

        if (!ObjectId.isValid(dsrId)) {
            return NextResponse.json(
                { error: "Invalid DSR ID" },
                { status: 400 },
            );
        }

        const db = await getDb();

        // Find company for the authenticated user first
        const company = await db
            .collection<CompanyDocument>("companies")
            .findOne({ adminUserId: session.session.userId });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 },
            );
        }

        // Get the current DSR for comparison
        const currentDSR = await db
            .collection<DSRRequestDocument>("dsrRequests")
            .findOne({
                _id: new ObjectId(dsrId),
                companyId: company._id,
            });

        if (!currentDSR) {
            return NextResponse.json(
                { error: "DSR not found" },
                { status: 404 },
            );
        }

        // Prepare update object
        const updateDoc: any = {
            updatedAt: new Date(),
        };

        if (updates.status) {
            updateDoc.status = updates.status;
        }

        if (updates.acknowledgedAt) {
            updateDoc.acknowledgedAt = updates.acknowledgedAt;
        }

        if (updates.completedAt) {
            updateDoc.completedAt = updates.completedAt;
        }

        if (updates.internalNotes) {
            updateDoc.internalNotes = updates.internalNotes;
        }

        // Update DSR and ensure it belongs to the user's company
        const result = await db
            .collection<DSRRequestDocument>("dsrRequests")
            .updateOne(
                {
                    _id: new ObjectId(dsrId),
                    companyId: company._id,
                },
                { $set: updateDoc },
            );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "DSR not found" },
                { status: 404 },
            );
        }

        // Log the DSR update
        const auditContext = extractAuditContext(request, session);
        const changes = Object.keys(updates).filter(
            (key) =>
                currentDSR[key as keyof DSRRequestDocument] !==
                updates[key as keyof UpdateDSRRequest],
        );

        const actionType =
            updates.status && updates.status !== currentDSR.status
                ? "DSR_STATUS_CHANGE"
                : updates.internalNotes
                  ? "DSR_NOTE_ADD"
                  : "DSR_UPDATE";

        await createAuditLog({
            action: actionType,
            resourceType: "DSR_REQUEST",
            resourceId: dsrId,
            metadata: {
                oldValues: Object.fromEntries(
                    changes.map((key) => [
                        key,
                        currentDSR[key as keyof DSRRequestDocument],
                    ]),
                ),
                newValues: updates,
                changes,
                requestType: currentDSR.requestType,
                description:
                    updates.status && updates.status !== currentDSR.status
                        ? `DSR status changed from ${currentDSR.status} to ${updates.status} by ${session.user.name}`
                        : updates.internalNotes
                          ? `Internal note added to DSR by ${session.user.name}`
                          : `DSR updated by ${session.user.name}`,
            },
            context: {
                ...auditContext,
                companyId: company._id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating DSR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
