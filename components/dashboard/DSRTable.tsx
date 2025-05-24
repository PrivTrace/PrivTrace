"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { DSRRequestDocument } from "@/types/database";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import DSRDetailView from "./DSRDetailView";

type DSRTableProps = {};

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function DSRTable({}: DSRTableProps) {
    const [dsrRequests, setDsrRequests] = useState<DSRRequestDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDSR, setSelectedDSR] = useState<DSRRequestDocument | null>(
        null,
    );
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        status: "ALL", // Updated default value to 'ALL'
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    useEffect(() => {
        fetchDSRRequests();
    }, [pagination.page, filters]);

    const fetchDSRRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            });

            if (filters.status && filters.status !== "ALL") {
                params.append("status", filters.status);
            }

            const response = await fetch(`/api/dsr?${params}`);
            if (!response.ok) {
                throw new Error("Failed to fetch DSR requests");
            }

            const data = await response.json();
            setDsrRequests(data.dsrRequests);
            setPagination(data.pagination);
        } catch (err) {
            setError("Failed to load DSR requests");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            NEW: { variant: "default" as const, label: "New" },
            PENDING_VERIFICATION: {
                variant: "secondary" as const,
                label: "Pending Verification",
            },
            IN_PROGRESS: { variant: "default" as const, label: "In Progress" },
            COMPLETED: { variant: "default" as const, label: "Completed" },
            REJECTED: { variant: "destructive" as const, label: "Rejected" },
            CANCELLED: { variant: "secondary" as const, label: "Cancelled" },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.NEW;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    if (loading && dsrRequests.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading DSR requests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchDSRRequests} className="mt-2">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                        value={filters.status}
                        onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, status: value }))
                        }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="PENDING_VERIFICATION">
                                Pending Verification
                            </SelectItem>
                            <SelectItem value="IN_PROGRESS">
                                In Progress
                            </SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onValueChange={(value) => {
                            const [sortBy, sortOrder] = value.split("-");
                            setFilters((prev) => ({
                                ...prev,
                                sortBy,
                                sortOrder,
                            }));
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt-desc">
                                Newest First
                            </SelectItem>
                            <SelectItem value="createdAt-asc">
                                Oldest First
                            </SelectItem>
                            <SelectItem value="status-asc">
                                Status A-Z
                            </SelectItem>
                            <SelectItem value="requestType-asc">
                                Type A-Z
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Requester</TableHead>
                                <TableHead>Request Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dsrRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        No DSR requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dsrRequests.map((dsr) => (
                                    <TableRow key={dsr._id.toString()}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {dsr.requesterName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {dsr.requesterEmail}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {dsr.requestType.replace(
                                                    "_",
                                                    " ",
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(dsr.status)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {formatDate(dsr.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedDSR(dsr)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Showing{" "}
                            {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(
                                pagination.page * pagination.limit,
                                pagination.total,
                            )}{" "}
                            of {pagination.total} results
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(pagination.page - 1)
                                }
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(pagination.page + 1)
                                }
                                disabled={
                                    pagination.page === pagination.totalPages
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* DSR Detail Modal */}
            {selectedDSR && (
                <DSRDetailView
                    dsr={selectedDSR}
                    onClose={() => setSelectedDSR(null)}
                    onUpdate={fetchDSRRequests}
                />
            )}
        </>
    );
}
