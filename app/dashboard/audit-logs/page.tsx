"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AuditLogsTable } from "@/components/dashboard/AuditLogsTable";

interface CompanyInfo {
    _id: string;
    name: string;
    dsrFormIdentifier: string;
    adminEmail: string;
}

export default function AuditLogsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
            return;
        }

        if (session) {
            fetchCompanyInfo();
        }
    }, [session, isPending, router]);

    const fetchCompanyInfo = async () => {
        try {
            const response = await fetch("/api/company/dashboard-info");
            if (!response.ok) {
                throw new Error("Failed to fetch company info");
            }
            const data = await response.json();
            setCompanyInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (isPending || loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-lg">Loading audit logs...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-red-600">Error: {error}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Audit Logs</h1>
                        <p className="text-muted-foreground">
                            {companyInfo ? `${companyInfo.name} - ` : ""}
                            View all system activity and changes
                        </p>
                    </div>
                </div>
            </div>

            <AuditLogsTable companyId={companyInfo?._id} />
        </div>
    );
}
