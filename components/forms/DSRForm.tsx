"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@heroui/alert"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface DSRFormProps {
    companyIdentifier: string;
}

export default function DSRForm({ companyIdentifier }: DSRFormProps) {
    const [formData, setFormData] = useState({
        requesterEmail: "",
        requesterName: "",
        requestType: "",
        details: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/dsr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    companyIdentifier,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to submit request");
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            Request Submitted Successfully
                        </h3>
                        <p className="text-sm text-gray-300">
                            Your data subject request has been submitted. You
                            will receive a confirmation email shortly, and the
                            company will process your request according to
                            applicable privacy regulations.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Submit Your Request</CardTitle>
                <CardDescription>
                    Please fill out all required fields to submit your data
                    subject request.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="faded" color="danger" title="Error" description={error} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="requesterName">Full Name *</Label>
                            <Input
                                id="requesterName"
                                type="text"
                                required
                                value={formData.requesterName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        requesterName: e.target.value,
                                    })
                                }
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requesterEmail">
                                Email Address *
                            </Label>
                            <Input
                                id="requesterEmail"
                                type="email"
                                required
                                value={formData.requesterEmail}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        requesterEmail: e.target.value,
                                    })
                                }
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requestType">Request Type *</Label>
                        <Select
                            value={formData.requestType}
                            onValueChange={(value) =>
                                setFormData({ ...formData, requestType: value })
                            }
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select request type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACCESS">
                                    Access My Data
                                </SelectItem>
                                <SelectItem value="DELETE">
                                    Delete My Data
                                </SelectItem>
                                <SelectItem value="CORRECT">
                                    Correct My Data
                                </SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="details">Additional Details</Label>
                        <Textarea
                            id="details"
                            value={formData.details}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    details: e.target.value,
                                })
                            }
                            placeholder="Please provide any additional information about your request..."
                            rows={4}
                        />
                    </div>
                        
                    <Alert variant="faded" color="primary" title="Privacy Notice" description="The information you provide will be used solely for processing your data subject request. We will respond to your request within the timeframe required by applicable privacy laws." />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Submitting Request..." : "Submit Request"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
