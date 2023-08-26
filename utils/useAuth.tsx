"use client";
import {useRouter} from "next/navigation";
import CryptoJS from "crypto-js";
import { useState, useEffect } from "react";

export default function useAuth() {
    console.log("utils/UseAuth.tsx")
    const [passAuth, setPassAuth] = useState<boolean>(false);
    const router = useRouter();
    const SESSION_IDENTIFIER = "sessionIdentifier";
    const SECRET_KEY = "secretKey"

    useEffect(() => {
        const encryptedSessionIdentifier = localStorage.getItem(SESSION_IDENTIFIER);
        console.log("encryptedSessionIdentifier " + encryptedSessionIdentifier)

        if (!encryptedSessionIdentifier) {
            // Redirect to login page if the session identifier is not found
            setPassAuth(false);
            console.log("Redirect to login page");
            router.push("/login");
            return;
        }
        const decryptedSessionIdentifier = CryptoJS.AES.decrypt(
            encryptedSessionIdentifier,
            SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);
        console.log("decryptedSessionIdentifier " + decryptedSessionIdentifier)

        const api = "/api/verify_session_identifier"
        fetch(api, {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": decryptedSessionIdentifier
            },
        })
            .then(async res => {
                const data = await res.json();
                if (res.ok) {
                    setPassAuth(true);
                    console.log("Pass auth")
                } else {
                    throw new Error(data.message || "Unknown Error");
                }
            })
            .catch(error => {
                    console.error("Error: ", error);
                    setPassAuth(false);
                    router.push("/login");
                }
            );
    }, []);
    return passAuth;
}
