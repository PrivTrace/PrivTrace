import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import type { CompanyDocument } from "@/types/database";

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

        const db = await getDb();
        const company = await db
            .collection<CompanyDocument>("companies")
            .findOne({ adminUserId: session.user.id });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            name: company.name,
            dsrFormIdentifier: company.dsrFormIdentifier,
            adminEmail: company.adminEmail,
        });
    } catch (error) {
        console.error("Error fetching dashboard info:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
