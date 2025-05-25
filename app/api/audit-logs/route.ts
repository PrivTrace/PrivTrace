import { getAuditLogs } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { CompanyDocument } from "@/types/database";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

// GET - Retrieve audit logs
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const companyId = searchParams.get("companyId");
        const resourceType = searchParams.get("resourceType");
        const action = searchParams.get("action");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = parseInt(searchParams.get("skip") || "0");
        const sortBy = searchParams.get("sortBy") as "timestamp" | "action" | "resourceType" || "timestamp";
        const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" || "desc";        // Verify user has access to the company
        if (companyId) {
            const db = await getDb();
            const company = await db
                .collection<CompanyDocument>("companies")
                .findOne({
                    _id: new ObjectId(companyId),
                    adminUserId: session.session.userId
                });

            if (!company) {
                return NextResponse.json(
                    { error: "Access denied to company audit logs" },
                    { status: 403 }
                );
            }
        }

        // Build filter options
        const filterOptions: any = {
            limit: Math.min(limit, 100), // Cap at 100 for performance
            skip,
            sortBy,
            sortOrder
        };

        if (companyId) {
            filterOptions.companyId = companyId;
        }

        if (resourceType) {
            filterOptions.resourceType = resourceType;
        }

        if (action) {
            filterOptions.action = action;
        }

        if (startDate) {
            filterOptions.startDate = new Date(startDate);
        }

        if (endDate) {
            filterOptions.endDate = new Date(endDate);
        }        // If no specific company is requested, only show logs for companies this user manages
        if (!companyId) {
            const db = await getDb();
            const userCompanies = await db
                .collection<CompanyDocument>("companies")
                .find({ adminUserId: session.session.userId })
                .toArray();

            if (userCompanies.length === 0) {
                return NextResponse.json({
                    logs: [],
                    total: 0,
                    hasMore: false
                });
            }

            // If user manages multiple companies, we'd need to modify the query
            // For now, we'll require a specific companyId
            if (userCompanies.length > 1) {
                return NextResponse.json(
                    { error: "Please specify a companyId when managing multiple companies" },
                    { status: 400 }
                );
            }

            filterOptions.companyId = userCompanies[0]._id;
        }

        const result = await getAuditLogs(filterOptions);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error retrieving audit logs:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
