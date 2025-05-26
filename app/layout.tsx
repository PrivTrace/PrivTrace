import clsx from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DSR Management SaaS",
    description: "Manage Data Subject Requests for your business",
    generator: "v0.dev",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={clsx(
                "min-h-screen bg-background font-sans antialiased",
                inter.className,
            )}>
                <Providers themeProps={{ attribute: "class", defaultTheme: "system", enableSystem: true, }}>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
