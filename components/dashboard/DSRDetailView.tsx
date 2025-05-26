"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import type { DSRRequestDocument, InternalNote } from "@/types/database";

interface DSRDetailViewProps {
    dsr: DSRRequestDocument;
    onClose: () => void;
    onUpdate: () => void;
}

export default function DSRDetailView({
    dsr,
    onClose,
    onUpdate,
}: DSRDetailViewProps) {
    const [status, setStatus] = useState(dsr.status);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleStatusUpdate = async () => {
        setLoading(true);
        setError("");

        try {
            const updateData: any = { status };

            // Set timestamps based on status
            if (status === "IN_PROGRESS" && !dsr.acknowledgedAt) {
                updateData.acknowledgedAt = new Date();
            }
            if (
                ["COMPLETED", "REJECTED", "CANCELLED"].includes(status) &&
                !dsr.completedAt
            ) {
                updateData.completedAt = new Date();
            }

            const response = await fetch(`/api/dsr/${dsr._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error("Failed to update DSR");
            }

            onUpdate();
            onClose();
        } catch (err) {
            setError("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setLoading(true);
        setError("");

        try {
            const newNoteObj: InternalNote = {
                note: newNote.trim(),
                adminUserId: "current-user", // This should come from session
                timestamp: new Date(),
            };

            const updatedNotes = [...dsr.internalNotes, newNoteObj];

            const response = await fetch(`/api/dsr/${dsr._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ internalNotes: updatedNotes }),
            });

            if (!response.ok) {
                throw new Error("Failed to add note");
            }

            setNewNote("");
            onUpdate();
        } catch (err) {
            setError("Failed to add note");
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

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>DSR Request Details</DialogTitle>
                    <DialogDescription>
                        Review and manage this data subject request
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Request Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">
                                    Requester Name
                                </Label>
                                <p className="text-lg font-medium">
                                    {dsr.requesterName}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">
                                    Email
                                </Label>
                                <p>{dsr.requesterEmail}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">
                                    Request Type
                                </Label>
                                <Badge variant="outline" className="mt-1">
                                    {dsr.requestType.replace("_", " ")}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">
                                    Current Status
                                </Label>
                                <div className="mt-1">
                                    {getStatusBadge(dsr.status)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">
                                    Submitted
                                </Label>
                                <p>{formatDate(dsr.createdAt)}</p>
                            </div>
                            {dsr.acknowledgedAt && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                        Acknowledged
                                    </Label>
                                    <p>{formatDate(dsr.acknowledgedAt)}</p>
                                </div>
                            )}
                            {dsr.completedAt && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">
                                        Completed
                                    </Label>
                                    <p>{formatDate(dsr.completedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Request Details */}
                    {dsr.details && (
                        <div>
                            <Label className="text-sm font-medium text-gray-500">
                                Additional Details
                            </Label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm">{dsr.details}</p>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Status Update */}
                    <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h3 className="text-lg font-medium">Update Status</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NEW">New</SelectItem>
                                        <SelectItem value="PENDING_VERIFICATION">
                                            Pending Verification
                                        </SelectItem>
                                        <SelectItem value="IN_PROGRESS">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="COMPLETED">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="REJECTED">
                                            Rejected
                                        </SelectItem>
                                        <SelectItem value="CANCELLED">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={loading || status === dsr.status}
                            >
                                {loading ? "Updating..." : "Update Status"}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Internal Notes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Internal Notes</h3>

                        {/* Existing Notes */}
                        {dsr.internalNotes.length > 0 && (
                            <div className="space-y-3">
                                {dsr.internalNotes.map((note, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-md p-3 bg-gray-50"
                                    >
                                        <p className="text-sm">{note.note}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {formatDate(note.timestamp)} •{" "}
                                            {note.adminUserId}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Note */}
                        <div className="space-y-2">
                            <Label htmlFor="newNote">Add Internal Note</Label>
                            <Textarea
                                id="newNote"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note for internal tracking..."
                                rows={3}
                            />
                            <Button
                                onClick={handleAddNote}
                                disabled={loading || !newNote.trim()}
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
