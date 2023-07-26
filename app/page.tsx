"use client";
import UserAuth from "@/utils/UserAuth";

export default function Home() {
    // Authentification
    // if succeed, redirect to homepage
    // else redirect to login
    UserAuth("/home");

    return (
        <>
            <p>Loading...</p>
            <p>You need to sign in first</p>
        </>
    );
}
