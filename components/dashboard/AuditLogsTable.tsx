import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Chip } from "@heroui/chip";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface AuditLog {
    _id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    companyId?: string;
    metadata: {
        description?: string;
        severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        [key: string]: any;
    };
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
}

interface AuditLogsResponse {
    logs: AuditLog[];
    total: number;
    hasMore: boolean;
}

interface AuditLogsTableProps {
    companyId?: string;
}

export function AuditLogsTable({ companyId }: AuditLogsTableProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        resourceType: "",
        action: "",
        startDate: "",
        endDate: "",
        limit: 50,
        skip: 0
    });
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const fetchAuditLogs = async (newFilters = filters) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (companyId) params.append("companyId", companyId);
            if (newFilters.resourceType) params.append("resourceType", newFilters.resourceType);
            if (newFilters.action) params.append("action", newFilters.action);
            if (newFilters.startDate) params.append("startDate", newFilters.startDate);
            if (newFilters.endDate) params.append("endDate", newFilters.endDate);
            params.append("limit", newFilters.limit.toString());
            params.append("skip", newFilters.skip.toString());
            params.append("sortBy", "timestamp");
            params.append("sortOrder", "desc");

            const response = await fetch(`/api/audit-logs?${params}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
            }

            const data: AuditLogsResponse = await response.json();

            if (newFilters.skip === 0) {
                setLogs(data.logs);
            } else {
                setLogs(prev => [...prev, ...data.logs]);
            }

            setTotal(data.total);
            setHasMore(data.hasMore);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch audit logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [companyId]);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value, skip: 0 };
        setFilters(newFilters);
        fetchAuditLogs(newFilters);
    };

    const loadMore = () => {
        const newFilters = { ...filters, skip: logs.length };
        setFilters(newFilters);
        fetchAuditLogs(newFilters);
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "CRITICAL": return "danger";
            case "HIGH": return "danger";
            case "MEDIUM": return "warning";
            case "LOW": return "default";
            default: return "default";
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes("CREATE")) return "success";
        if (action.includes("UPDATE") || action.includes("CHANGE")) return "warning";
        if (action.includes("DELETE")) return "danger";
        if (action.includes("LOGIN") || action.includes("REGISTER")) return "success";
        return "default";
    };

    const formatUserAgent = (userAgent?: string) => {
        if (!userAgent || userAgent === "unknown") return "Unknown";

        // Extract browser and OS info from user agent string
        const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
        const browser = browserMatch ? browserMatch[0] : "Unknown Browser";

        return browser.length > 30 ? browser.substring(0, 30) + "..." : browser;
    };

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-600">Error: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>            <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Audit Logs</CardTitle>
                <Chip variant="bordered" className="ml-2 font-mono">
                    {total} entries
                </Chip>
            </div>
            <p className="text-muted-foreground mt-2">
                Track all system activities and user actions
            </p>

            <div className="mt-6 p-4 border rounded-lg bg-muted/10">
                <h4 className="font-medium mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter Logs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="resourceType" className="text-xs font-medium">Resource Type</Label>
                        <Select
                            value={filters.resourceType}
                            onValueChange={(value) => handleFilterChange("resourceType", value)}
                        >
                            <SelectTrigger className="w-full mt-1 shadow-sm">
                                <SelectValue placeholder="All Resources" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Resources</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="COMPANY">Company</SelectItem>
                                <SelectItem value="DSR_REQUEST">DSR Request</SelectItem>
                                <SelectItem value="SYSTEM">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="action" className="text-xs font-medium">Action</Label>
                        <Select
                            value={filters.action}
                            onValueChange={(value) => handleFilterChange("action", value)}
                        >
                            <SelectTrigger className="mt-1 shadow-sm">
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Actions</SelectItem>
                                <SelectItem value="DSR_CREATE">DSR Create</SelectItem>
                                <SelectItem value="DSR_UPDATE">DSR Update</SelectItem>
                                <SelectItem value="DSR_STATUS_CHANGE">DSR Status Change</SelectItem>
                                <SelectItem value="USER_LOGIN">User Login</SelectItem>
                                <SelectItem value="USER_REGISTER">User Register</SelectItem>
                                <SelectItem value="COMPANY_CREATE">Company Create</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="startDate" className="text-xs font-medium">Start Date</Label>
                        <Input
                            type="date"
                            className="mt-1 shadow-sm"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="endDate" className="text-xs font-medium">End Date</Label>
                        <Input
                            type="date"
                            className="mt-1 shadow-sm"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </CardHeader>
            <CardContent>
                {loading && logs.length === 0 ? (
                    <div className="text-center py-4">Loading audit logs...</div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {logs.length} of {total} entries
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log._id} className="hover:bg-muted/50 transition-colors cursor-pointer">                                        <TableCell className="text-sm whitespace-nowrap">
                                        <div className="font-medium">
                                            {format(new Date(log.timestamp), "MMM dd, yyyy")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(log.timestamp), "HH:mm:ss")}
                                        </div>
                                    </TableCell>
                                        <TableCell>
                                            <Chip
                                                variant="bordered"
                                                size="sm"
                                                radius="sm"
                                                color={getActionColor(log.action)}
                                                className="shadow-sm transition-all group-hover:shadow"
                                            >
                                                {log.action.toLowerCase().includes('dsr') ? 'DSR ' : ''}
                                                {log.action.split('_')
                                                    .filter(word => word !== 'DSR')
                                                    .map(word =>
                                                        word.charAt(0) + word.slice(1).toLowerCase()
                                                    ).join(' ')}

                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip radius="sm" size="sm">
                                                {log.resourceType.replace(/_/g, " ")}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-xs">
                                                    {log.userName || "No email"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div
                                                className="p-2 bg-muted/30 border border-transparent rounded-md text-sm group-hover:bg-muted/50 group-hover:border-border transition-colors"
                                                title={log.metadata.description}
                                            >
                                                <span className="font-medium">{log.metadata.description?.split(' ').slice(0, 3).join(' ')}</span>{' '}
                                                <span className="text-muted-foreground">{log.metadata.description?.split(' ').slice(3).join(' ') || "No description"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                variant="dot"
                                                size="sm"
                                                radius="sm"
                                                color={getSeverityColor(log.metadata.severity)}
                                                className={`
                                                    transition-all shadow-sm group-hover:shadow
                                                    ${log.metadata.severity === 'HIGH' || log.metadata.severity === 'CRITICAL' ?
                                                        'group-hover:animate-pulse' : ''}
                                                `}
                                            >
                                                {log.metadata.severity === 'CRITICAL' && '⚠️ '}
                                                {log.metadata.severity || "LOW"}
                                            </Chip>
                                        </TableCell>                                        <TableCell className="text-sm">
                                            <div className="font-mono text-xs bg-muted/30 px-2 py-1 rounded-md inline-block">
                                                {log.ipAddress || "Unknown"}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                                <svg className="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {formatUserAgent(log.userAgent)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>                        {hasMore && (
                            <div className="text-center mt-6">
                                <Button
                                    onClick={loadMore}
                                    disabled={loading}
                                    variant="outline"
                                    className="px-8 shadow-sm relative overflow-hidden group"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-muted-foreground inline" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More
                                            <span className="ml-1">({total - logs.length} remaining)</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}{logs.length === 0 && !loading && (
                            <div className="text-center py-16 text-muted-foreground border border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                                <svg className="w-12 h-12 mx-auto text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-4 font-medium">No audit logs found</p>
                                <p className="mt-1">Try adjusting your filters to find what you're looking for.</p>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
