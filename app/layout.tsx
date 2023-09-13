/**
 * The root layout is a Server Component by default and can not be set to a Client Component.
 */

import React from "react";
/**
 * External stylesheets must be directly imported from a npm package or downloaded and co-located with your codebase.
 * You cannot use <link rel="stylesheet" />
 */
import "bootstrap/dist/css/bootstrap.css";
import "katex/dist/katex.min.css";

import type {Metadata} from "next";
import {Inter} from "next/font/google";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    /*TODO:*/
    title: "ONLINE WORKSHOP",
    description: "USEFUL TOOL FOR LL(1) GRAMMARS",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang={"en-GB"}>
            <body
                className={inter.className + " bg-primary-subtle d-grid align-items-center justify-content-center"}
            >{children}</body>
        </html>
    );
}
