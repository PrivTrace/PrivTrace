import { auth } from "@/lib/auth";
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
            .findOne({ adminUserId: session.user.id });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 },
            );
        }

        // Find DSR and ensure it belongs to the user's company
        const dsrRequest = await db
            .collection<DSRRequestDocument>("dsrRequests")
            .findOne({
                _id: new ObjectId(dsrId),
                companyId: company._id,
            });

        if (!dsrRequest) {
            return NextResponse.json(
                { error: "DSR not found" },
                { status: 404 },
            );
        }

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

        // Find company for the authenticated user
        const company = await db
            .collection<CompanyDocument>("companies")
            .findOne({ adminUserId: session.user.id });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating DSR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
