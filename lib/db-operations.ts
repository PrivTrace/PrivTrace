import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

// Company operations
export async function createCompany(companyData: {
    name: string;
    identifier: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
}) {
    const db = await getDb();
    const result = await db.collection("companies").insertOne({
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return result;
}

export async function getCompanyByIdentifier(identifier: string) {
    const db = await getDb();
    return await db.collection("companies").findOne({ identifier });
}

export async function getAllCompanies() {
    const db = await getDb();
    return await db.collection("companies").find({}).toArray();
}

// DSR operations
export async function createDSR(dsrData: {
    companyId: string;
    title: string;
    description?: string;
    status: "pending" | "in-progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    assignedTo?: string;
    dueDate?: Date;
}) {
    const db = await getDb();
    const result = await db.collection("dsrs").insertOne({
        ...dsrData,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return result;
}

export async function getDSRById(id: string) {
    const db = await getDb();
    return await db.collection("dsrs").findOne({ _id: new ObjectId(id) });
}

export async function getDSRsByCompany(companyId: string) {
    const db = await getDb();
    return await db.collection("dsrs").find({ companyId }).toArray();
}

export async function updateDSR(
    id: string,
    updateData: Partial<{
        title: string;
        description: string;
        status: "pending" | "in-progress" | "completed" | "cancelled";
        priority: "low" | "medium" | "high";
        assignedTo: string;
        dueDate: Date;
    }>,
) {
    const db = await getDb();
    const result = await db.collection("dsrs").updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...updateData,
                updatedAt: new Date(),
            },
        },
    );
    return result;
}

// User operations
export async function createUser(userData: {
    email: string;
    name: string;
    role?: "admin" | "user";
}) {
    const db = await getDb();
    const result = await db.collection("users").insertOne({
        ...userData,
        role: userData.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return result;
}

export async function getUserByEmail(email: string) {
    const db = await getDb();
    return await db.collection("users").findOne({ email });
}

// Database health check
export async function checkDatabaseConnection() {
    try {
        const db = await getDb();
        await db.admin().ping();
        return {
            status: "connected",
            message: "Database connection successful",
        };
    } catch (error) {
        return {
            status: "error",
            message: `Database connection failed: ${error}`,
        };
    }
}
