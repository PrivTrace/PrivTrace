import DSRForm from "@/components/forms/DSRForm";
import { notFound } from "next/navigation";

async function getCompanyInfo(companyIdentifier: string) {
    try {
        const response = await fetch(
            `https://dev.untraceable.dev/api/company/form-info/${companyIdentifier}`,
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

export default async function DSRPage({
    params,
}: {
    params: Promise<{ companyIdentifier: string }>;
}) {
    const { companyIdentifier } = await params;
    const companyInfo = await getCompanyInfo(companyIdentifier);

    if (!companyInfo) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">
                        Data Subject Request
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Submit a request to {companyInfo.name}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground/80">
                        Use this form to request access to, correction of, or
                        deletion of your personal data in accordance with
                        applicable privacy regulations.
                    </p>
                </div>

                <DSRForm companyIdentifier={companyIdentifier} />
            </div>
        </div>
    );
}
