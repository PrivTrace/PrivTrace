"use client"

import DSRForm from "@/components/forms/DSRForm";
import { useQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";

async function getCompanyInfo(companyIdentifier: string) {
    try {
        const response = await fetch(
            `/api/company/form-info/${companyIdentifier}`,
            {
                cache: "no-store",
            },
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching company info:", error);
        return null;
    }
}

export default function DSRPage() {
    const { companyIdentifier } = useParams();
    if (!companyIdentifier) {
        notFound();
    }
    const { data: companyInfo, isLoading } = useQuery({
        queryKey: ['companyInfo', companyIdentifier],
        queryFn: () => getCompanyInfo(companyIdentifier as string),
    });
    
    if (isLoading) {
        return <div>Loading company information...</div>;
    }

    if (!companyInfo) {
        console.log("Company info not found for identifier:", companyIdentifier);
        notFound();
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Data Subject Request</h1>
                    <p className="mt-2 text-lg text-gray-300">
                        Submit a request to {companyInfo.name}
                    </p>
                    <p className="mt-4 text-sm text-gray-300">
                        Use this form to request access to, correction of, or
                        deletion of your personal data in accordance with
                        applicable privacy regulations.
                    </p>
                </div>

                <DSRForm companyIdentifier={companyIdentifier as string} />
            </div>
        </div>
    );
}