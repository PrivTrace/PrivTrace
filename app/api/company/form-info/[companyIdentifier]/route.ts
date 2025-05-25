import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { CompanyDocument } from "@/types/database";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ companyIdentifier: string }> },
) {
    try {
        const { companyIdentifier } = await params;

        if (!companyIdentifier) {
            return NextResponse.json(
                { error: "Company identifier is required" },
                { status: 400 },
            );
        }

        const db = await getDb();
        const company = await db
            .collection<CompanyDocument>("companies")
            .findOne({ dsrFormIdentifier: companyIdentifier });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 },
            );
        }

        // Return only public-safe information
        return NextResponse.json({
            name: company.name,
            identifier: company.dsrFormIdentifier,
        });
    } catch (error) {
        console.error("Error fetching company info:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
