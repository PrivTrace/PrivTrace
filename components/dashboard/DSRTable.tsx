"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Chip } from "@heroui/chip";
import { useQuery } from "@tanstack/react-query";
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

export default function DSRTable({ }: DSRTableProps) {
    const [filters, setFilters] = useState({
        status: "ALL",
        sortBy: "createdAt",
        sortOrder: "desc",
        email: "",
    });
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [selectedDSR, setSelectedDSR] = useState<DSRRequestDocument | null>(
        null,
    );

    // Fetch DSR requests with useQuery
    const {
        data: allDsrRequests = [],
        isLoading: loading,
        isError,
        error,
        refetch,
    } = useQuery<DSRRequestDocument[], Error>({
        queryKey: [
            "dsrRequests",
            filters.status,
            filters.sortBy,
            filters.sortOrder,
        ],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: "1",
                limit: "1000",
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
            return data.dsrRequests;
        },
    });

    // Client-side filtering for email and pagination
    const filteredRequests = filters.email.trim()
        ? allDsrRequests.filter((dsr: DSRRequestDocument) =>
            dsr.requesterEmail.toLowerCase().includes(filters.email.toLowerCase())
        )
        : allDsrRequests;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const displayedDsrRequests = filteredRequests.slice(startIndex, endIndex);

    // Update pagination info when filteredRequests or pagination changes
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: filteredRequests.length,
            totalPages: Math.ceil(filteredRequests.length / prev.limit),
        }));
    }, [filteredRequests.length, pagination.limit]);

    const getStatusChip = (status: string) => {
        const statusConfig = {
            NEW: { color: "primary" as const, label: "New" },
            PENDING_VERIFICATION: {
                color: "secondary" as const,
                label: "Pending Verification",
            },
            IN_PROGRESS: { color: "primary" as const, label: "In Progress" },
            COMPLETED: { color: "primary" as const, label: "Completed" },
            REJECTED: { color: "danger" as const, label: "Rejected" },
            CANCELLED: { color: "secondary" as const, label: "Cancelled" },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.NEW;
        return <Chip variant="solid" radius="sm" size="sm" color="success">{config.label}</Chip>;
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

    if (loading && displayedDsrRequests.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-300">Loading DSR requests...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{(error as Error)?.message || "Failed to load DSR requests"}</p>
                <Button onClick={() => refetch()} className="mt-2">
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
                    {/* Email search input */}
                    <div className="relative w-full sm:w-64">
                        <Input
                            type="email"
                            placeholder="Search by email"
                            className="w-full p-2 border rounded-md"
                            value={filters.email}
                            onChange={(e) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }));
                            }}
                        />
                        {filters.email && (
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                onClick={() => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        email: "",
                                    }));
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

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
                            {displayedDsrRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-300">
                                        No DSR requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedDsrRequests.map((dsr: DSRRequestDocument) => (
                                    <TableRow key={dsr._id.toString()}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {dsr.requesterName}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {dsr.requesterEmail}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip variant="solid" radius="sm" size="sm" color="primary">
                                                {dsr.requestType.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(dsr.status)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-300">
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
                    onUpdate={refetch}
                />
            )}
        </>
    );
}
