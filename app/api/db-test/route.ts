import { checkDatabaseConnection } from "@/lib/db-operations";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await checkDatabaseConnection();

        if (result.status === "connected") {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json(
            { status: "error", message: `Database test failed: ${error}` },
            { status: 500 },
        );
    }
}
