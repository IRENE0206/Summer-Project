"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserAuth(url?: string) {
    const [passAuth, setPassAuth] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const sessionIdentifier = localStorage.getItem("sessionIdentifier");
        if (!sessionIdentifier) {
            // Redirect to login page if the session identifier is not found
            console.log("Redirect to login page");
            router.push("/login");
        } else {
            setPassAuth(true);
        }
        if (url !== undefined) {
            router.push(url);
        }
    }, [url, router]);
    console.log("Session identifier is found");
    return passAuth;
}
