import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Clock, FileText, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-card shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-primary mr-3" />
                            <h1 className="text-2xl font-bold text-foreground">
                                PrivTrace
                            </h1>
                        </div>
                        <div className="space-x-4">
                            <Link href="/login">
                                <Button variant="outline">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Simplify Data Subject Request Management
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        Streamline GDPR and CCPA compliance with our easy-to-use
                        DSR management platform. Handle data access, deletion,
                        and correction requests efficiently.
                    </p>
                    <div className="space-x-4">
                        <Link href="/signup">
                            <Button size="lg" className="px-8 py-3">
                                Get Started For Free
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <Card>
                        <CardHeader>
                            <FileText className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Easy Form Creation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Get a public DSR form link instantly. No
                                technical setup required.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Users className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Customer Self-Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Let customers submit requests directly through
                                your branded form.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Clock className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Request Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Track request status, add notes, and manage
                                deadlines efficiently.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Shield className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Compliance Ready</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Built with GDPR and CCPA requirements in mind
                                for peace of mind.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* How it Works */}
                <div className="text-center mb-16">
                    <h3 className="text-3xl font-bold text-foreground mb-8">
                        How It Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-accent-foreground">
                                    1
                                </span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">
                                Sign Up & Setup
                            </h4>
                            <p className="text-muted-foreground">
                                Create your account and get your unique DSR form
                                link instantly.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-accent-foreground">
                                    2
                                </span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">
                                Share Your Form
                            </h4>
                            <p className="text-muted-foreground">
                                Add the form link to your website or share it
                                with customers.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-accent-foreground">
                                    3
                                </span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">
                                Manage Requests
                            </h4>
                            <p className="text-muted-foreground">
                                Receive notifications and manage all requests
                                from your dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-card rounded-lg shadow-lg p-8 text-center">
                    <h3 className="text-2xl font-bold text-card-foreground mb-4">
                        Ready to Streamline Your DSR Process?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Join hundreds of businesses already using DSR Manager to
                        handle their data subject requests.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-8 py-3">
                            Get Started Today
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-700 text-muted-foreground py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <Shield className="h-6 w-6 mr-2" />
                            <span className="text-lg font-semibold">
                                DSR Manager
                            </span>
                        </div>
                        <p className="text-muted-foreground">
                            © 2025 DSR Manager. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
