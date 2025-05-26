import { createAuditLog, extractAuditContext } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import { encryptDSRData, decryptDSRData } from "@/lib/encryption";
import {
    generateDSRConfirmationEmail,
    generateDSRNotificationEmail,
    sendEmail,
} from "@/lib/mail";
import { getDb } from "@/lib/mongodb";
import type {
    CompanyDocument,
    CreateDSRRequest,
    DSRRequestDocument,
} from "@/types/database";
import { type NextRequest, NextResponse } from "next/server";

// POST - Create new DSR (Public)
export async function POST(request: NextRequest) {
    try {
        const body: CreateDSRRequest = await request.json();

        // Validate required fields
        if (
            !body.companyIdentifier ||
            !body.requesterEmail ||
            !body.requesterName ||
            !body.requestType
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.requesterEmail)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 },
            );
        }

        // Validate request type
        const validRequestTypes = ["ACCESS", "DELETE", "CORRECT", "OTHER"];
        if (!validRequestTypes.includes(body.requestType)) {
            return NextResponse.json(
                { error: "Invalid request type" },
                { status: 400 },
            );
        }

        const db = await getDb();

        // Find company by identifier
        const company = await db
            .collection<CompanyDocument>("companies")
            .findOne({ dsrFormIdentifier: body.companyIdentifier });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 },
            );
        }

        // Encrypt sensitive data before storing
        const encryptedData = encryptDSRData({
            requesterEmail: body.requesterEmail,
            requesterName: body.requesterName,
            requestType: body.requestType,
            details: body.details,
        });

        // Create DSR request with encrypted data
        const dsrRequest: Omit<DSRRequestDocument, "_id"> = {
            companyId: company._id,
            requesterEmail: encryptedData.requesterEmail,
            requesterEmailHash: encryptedData.requesterEmailHash,
            requesterName: encryptedData.requesterName,
            requestType: encryptedData.requestType,
            details: encryptedData.details,
            status: "NEW",
            internalNotes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection<Omit<DSRRequestDocument, "_id">>("dsrRequests")
            .insertOne(dsrRequest);

        // Create audit log for DSR creation
        const auditContext = extractAuditContext(request);
        await createAuditLog({
            action: "DSR_CREATE",
            resourceType: "DSR_REQUEST",
            resourceId: result.insertedId,
            metadata: {
                requestType: body.requestType,
                requesterEmail: body.requesterEmail,
                requesterName: body.requesterName,
                companyName: company.name,
                description: `New DSR request created by ${body.requesterName} (${body.requestType})`,
            },
            context: {
                ...auditContext,
                companyId: company._id,
                userEmail: body.requesterEmail,
                userName: body.requesterName,
            },
        });

        // Send email notification to admin
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
        const adminEmailContent = generateDSRNotificationEmail(
            {
                requesterName: body.requesterName,
                requesterEmail: body.requesterEmail,
                requestType: body.requestType,
                details: body.details,
            },
            company.name,
            dashboardUrl,
        );

        const customerEmailContent = generateDSRConfirmationEmail(
            {
                requesterName: body.requesterName,
                requesterEmail: body.requesterEmail,
                requestType: body.requestType,
                details: body.details,
            },
            company.name,
        );

        await sendEmail({
            to: company.adminEmail,
            subject: adminEmailContent.subject,
            html: adminEmailContent.html,
        });

        await sendEmail({
            to: body.requesterEmail,
            subject: customerEmailContent.subject,
            html: customerEmailContent.html,
        });

        return NextResponse.json({
            success: true,
            dsrId: result.insertedId.toString(),
        });
    } catch (error) {
        console.error("Error creating DSR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// GET - List DSRs for authenticated admin
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const page = Number.parseInt(searchParams.get("page") || "1");
        const limit = Number.parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

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

        // Build query
        const query: any = { companyId: company._id };
        if (status) {
            query.status = status;
        }
        
        // If searching by email, use the hash for security
        const searchEmail = searchParams.get("email");
        if (searchEmail) {
            // Import hashValue from the encryption module
            const { hashValue } = require("@/lib/encryption");
            query.requesterEmailHash = hashValue(searchEmail.toLowerCase());
        }

        // Get total count
        const total = await db
            .collection<DSRRequestDocument>("dsrRequests")
            .countDocuments(query);

        // Get paginated results
        const encryptedDsrRequests = await db
            .collection<DSRRequestDocument>("dsrRequests")
            .find(query)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
            
        // Decrypt the DSR data before sending to client
        const dsrRequests = encryptedDsrRequests.map(dsr => {
            // Create a copy of the DSR object
            const decryptedDsr = { ...dsr };
            
            // Only decrypt the sensitive fields
            const decrypted = decryptDSRData({
                requesterEmail: dsr.requesterEmail,
                requesterName: dsr.requesterName,
                requestType: dsr.requestType,
                details: dsr.details,
            });
            
            // Update with decrypted values
            decryptedDsr.requesterEmail = decrypted.requesterEmail;
            decryptedDsr.requesterName = decrypted.requesterName;
            decryptedDsr.requestType = decrypted.requestType as any;
            decryptedDsr.details = decrypted.details;
            
            return decryptedDsr;
        });

        return NextResponse.json({
            dsrRequests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching DSRs:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
