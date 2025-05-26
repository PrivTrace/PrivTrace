"use client";

import DSRTable from "@/components/dashboard/DSRTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                DSR Dashboard
                            </h1>
                            <p className="text-muted-foreground">
                                {companyInfo?.name}
                            </p>
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
                                <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm text-muted-foreground">
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

                    {/* Audit Logs Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>
                                View detailed logs of all system activity and
                                changes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Track user logins, DSR changes, and system
                                    events
                                </div>
                                <Button
                                    onClick={() =>
                                        router.push("/dashboard/audit-logs")
                                    }
                                    variant="outline"
                                >
                                    View Audit Logs
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* DSR Requests Table */}
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
                </div>
            </main>
        </div>
    );
}
