/**
 * The root layout is a Server Component by default and can not be set to a Client Component.
 */
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";
import React from "react";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={"bg-primary-subtle"}>{children}</body>
        </html>
    );
}
