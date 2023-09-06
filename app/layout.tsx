/**
 * The root layout is a Server Component by default and can not be set to a Client Component.
 */
import React from "react";
/*
External stylesheets must be directly imported from a npm package or downloaded and co-located with your codebase.
You cannot use <link rel="stylesheet" />
 */
import "bootstrap/dist/css/bootstrap.css";
import "katex/dist/katex.min.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang={"en-GB"}>
            <body className={"bg-primary-subtle d-grid align-items-center justify-content-center"}>{children}</body>
        </html>
    );
}
