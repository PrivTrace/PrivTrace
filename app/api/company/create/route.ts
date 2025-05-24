import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { CompanyDocument } from "@/types/database";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const { name, adminUserId, adminEmail } = await request.json();

        if (!name || !adminUserId || !adminEmail) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const db = await getDb();

        // Check if company already exists for this user
        const existingCompany = await db
            .collection<CompanyDocument>("companies")
            .findOne({ adminUserId });

        if (existingCompany) {
            return NextResponse.json(
                { error: "Company already exists for this user" },
                { status: 409 },
            );
        }

        // Create company with unique DSR form identifier
        const company: Omit<CompanyDocument, "_id"> = {
            name,
            adminUserId,
            dsrFormIdentifier: uuidv4(),
            adminEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection<CompanyDocument>("companies")
            .insertOne(company);

        return NextResponse.json({
            success: true,
            companyId: result.insertedId.toString(),
            dsrFormIdentifier: company.dsrFormIdentifier,
        });
    } catch (error) {
        console.error("Error creating company:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
