"use client";
import UseAuth from "@/utils/UseAuth";

export default function Home() {
    UseAuth("/home");

    return (
        <>
            <p>Loading...</p>
            <p>You need to sign in first</p>
        </>
    );
}
