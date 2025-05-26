import { ObjectId } from "mongodb";
import { createAuditLog, type AuditLogContext } from "./audit-logger";
import { getDb } from "./mongodb";

// Company operations
export async function createCompany(
    companyData: {
        name: string;
        identifier: string;
        address?: string;
        contactEmail?: string;
        contactPhone?: string;
    },
    auditContext?: AuditLogContext,
) {
    const db = await getDb();
    const result = await db.collection("companies").insertOne({
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Log the company creation
    if (auditContext) {
        await createAuditLog({
            action: "COMPANY_CREATE",
            resourceType: "COMPANY",
            resourceId: result.insertedId,
            metadata: {
                companyName: companyData.name,
                identifier: companyData.identifier,
                description: `Company "${companyData.name}" created`,
            },
            context: auditContext,
        });
    }

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
export async function createDSR(
    dsrData: {
        companyId: string;
        title: string;
        description?: string;
        status: "pending" | "in-progress" | "completed" | "cancelled";
        priority: "low" | "medium" | "high";
        assignedTo?: string;
        dueDate?: Date;
    },
    auditContext?: AuditLogContext,
) {
    const db = await getDb();
    const result = await db.collection("dsrs").insertOne({
        ...dsrData,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Log the DSR creation
    if (auditContext) {
        await createAuditLog({
            action: "DSR_CREATE",
            resourceType: "DSR_REQUEST",
            resourceId: result.insertedId,
            metadata: {
                title: dsrData.title,
                status: dsrData.status,
                priority: dsrData.priority,
                description: `DSR "${dsrData.title}" created`,
            },
            context: {
                ...auditContext,
                companyId: dsrData.companyId,
            },
        });
    }

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
    auditContext?: AuditLogContext,
) {
    const db = await getDb();

    // Get the old values for audit trail
    const oldDSR = await db
        .collection("dsrs")
        .findOne({ _id: new ObjectId(id) });

    const result = await db.collection("dsrs").updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...updateData,
                updatedAt: new Date(),
            },
        },
    );

    // Log the DSR update
    if (auditContext && oldDSR) {
        const changes = Object.keys(updateData).filter(
            (key) => oldDSR[key] !== updateData[key as keyof typeof updateData],
        );

        await createAuditLog({
            action:
                updateData.status && updateData.status !== oldDSR.status
                    ? "DSR_STATUS_CHANGE"
                    : "DSR_UPDATE",
            resourceType: "DSR_REQUEST",
            resourceId: id,
            metadata: {
                oldValues: Object.fromEntries(
                    changes.map((key) => [key, oldDSR[key]]),
                ),
                newValues: updateData,
                changes,
                description:
                    updateData.status && updateData.status !== oldDSR.status
                        ? `DSR status changed from ${oldDSR.status} to ${updateData.status}`
                        : `DSR updated`,
            },
            context: {
                ...auditContext,
                companyId: oldDSR.companyId,
            },
        });
    }

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
