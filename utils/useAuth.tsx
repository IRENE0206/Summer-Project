"use client";
import {useRouter} from "next/navigation";
import CryptoJS from "crypto-js";
import {useEffect, useState} from "react";
import {SECRET_KEY, SESSION_IDENTIFIER} from "@/utils/constants";

export default function useAuth() {
    console.log("Before useAuth useState calls");
    const [passAuth, setPassAuth] = useState<boolean | null>(null);
    const router = useRouter();
    const api = "/api/verify_session_identifier";

    useEffect(() => {
        if (passAuth !== null) {
            return;
        }
        const authenticate = async () => {
            const encryptedSessionIdentifier = localStorage.getItem(SESSION_IDENTIFIER);

            // Redirect to login page if the session identifier is not found
            if (!encryptedSessionIdentifier) {
                setPassAuth(false);
                router.push("/");
                return;
            }

            const decryptedSessionIdentifier = CryptoJS.AES.decrypt(
                encryptedSessionIdentifier,
                SECRET_KEY
            ).toString(CryptoJS.enc.Utf8);

            const res = await fetch(api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: decryptedSessionIdentifier,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setPassAuth(true);
            } else {
                // Handle error without throwing
                console.error(data.message || "Unknown Error");
                setPassAuth(false);
                router.push("/");
            }
        };

        // Run the authentication
        authenticate().catch(e => console.error(e));
    }, [passAuth]);
    return passAuth;
}
