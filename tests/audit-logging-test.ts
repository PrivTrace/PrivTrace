import { ObjectId } from "mongodb";
import { createAuditLog, getAuditLogs } from "../lib/audit-logger";
import { getDb } from "../lib/mongodb";

async function testAuditLogging() {
    console.log("Testing audit logging system...");

    try {
        // Test creating an audit log
        const testUserId = new ObjectId().toString();
        const testResourceId = new ObjectId().toString();

        const auditLogId = await createAuditLog({
            action: "DSR_CREATE",
            resourceType: "DSR_REQUEST",
            resourceId: testResourceId,
            metadata: {
                description: "Test audit log creation",
                severity: "MEDIUM",
                requestType: "ACCESS",
            },
            context: {
                userId: testUserId,
                userEmail: "test@example.com",
                userName: "Test User",
                ipAddress: "127.0.0.1",
                userAgent: "Test User Agent",
            },
        });

        console.log(
            "✅ Audit log created successfully:",
            auditLogId.toString(),
        );

        // Test retrieving audit logs
        const logs = await getAuditLogs({
            limit: 5,
            sortBy: "timestamp",
            sortOrder: "desc",
        });

        console.log(
            "✅ Retrieved audit logs:",
            logs.logs.length,
            "total:",
            logs.total,
        );

        // Test filtering by action
        const filteredLogs = await getAuditLogs({
            action: "DSR_CREATE",
            limit: 5,
        });

        console.log(
            "✅ Filtered audit logs by action:",
            filteredLogs.logs.length,
        );

        // Verify the test audit log exists
        const testLog = logs.logs.find(
            (log) => log._id.toString() === auditLogId.toString(),
        );
        if (testLog) {
            console.log("✅ Test audit log found in results");
            console.log("   Action:", testLog.action);
            console.log("   Resource Type:", testLog.resourceType);
            console.log("   User:", testLog.userName);
            console.log("   Description:", testLog.metadata.description);
        } else {
            console.log("❌ Test audit log not found in results");
        }

        // Clean up test data
        const db = await getDb();
        await db.collection("auditLogs").deleteOne({ _id: auditLogId });
        console.log("✅ Test data cleaned up");

        console.log("\n🎉 All audit logging tests passed!");
    } catch (error) {
        console.error("❌ Audit logging test failed:", error);
        throw error;
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testAuditLogging()
        .then(() => {
            console.log("Test completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Test failed:", error);
            process.exit(1);
        });
}

export { testAuditLogging };
