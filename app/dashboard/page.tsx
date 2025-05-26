"use client";

import { AuditLogsTable } from "@/components/dashboard/AuditLogsTable";
import DSRTable from "@/components/dashboard/DSRTable";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";
import { Alert } from "@heroui/alert";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CompanyInfo {
    name: string;
    dsrFormIdentifier: string;
    adminEmail: string;
}

export default function DashboardPage() {
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
            setError("Failed to load company information");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    const copyFormLink = () => {
        if (companyInfo) {
            const formUrl = `${window.location.origin}/dsr/${companyInfo.dsrFormIdentifier}`;
            navigator.clipboard.writeText(formUrl);
            // You could add a toast notification here
        }
    };

    if (isPending || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="faded" color="danger" title="Error" description={error} />
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <header className="shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-200">
                                DSR Dashboard
                            </h1>
                            <p className="text-gray-300">{companyInfo?.name}</p>
                        </div>
                        <Button onClick={handleSignOut} variant="outline">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* DSR Form Link Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your DSR Form Link</CardTitle>
                            <CardDescription>
                                Share this link with your customers so they can
                                submit data subject requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 p-3 rounded-md font-mono text-sm">
                                    {companyInfo &&
                                        `${window.location.origin}/dsr/${companyInfo.dsrFormIdentifier}`}
                                </div>
                                <Button
                                    onClick={copyFormLink}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (companyInfo) {
                                            window.open(
                                                `/dsr/${companyInfo.dsrFormIdentifier}`,
                                                "_blank",
                                            );
                                        }
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Subject Requests</CardTitle>
                                <CardDescription>
                                    Manage and track all DSR submissions from your
                                    customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DSRTable />
                            </CardContent>
                        </Card>
                    {/* Audit Log */}
                    <AuditLogsTable />

                    {/* DSR Requests Table */}
                </div>
            </main>
        </div>
    );
}
