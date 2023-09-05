"use client";
import {useEffect, useState} from "react";
import {UserInfoInterface} from "@/interfaces/Interfaces";

export default function useUserInfo() {
    console.log("Before useUserInfo useState calls");
    const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const api = "/api/user";

    useEffect(() => {
        if (userInfo !== null) {
            return;
        }
        const fetchUserInfo = async () => {
            const res = await fetch(api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (res.ok) {
                setUserInfo(data);
            } else {
                console.error("Error: ", data.message || "Failed to fetch user info");
                setError(new Error(data.message || "An unknown error occurred while fetching user info"));
            }
        };

        // Run the fetch user info function
        fetchUserInfo().catch(e => console.error(e));
    }, [userInfo]);
    return {userInfo, error};
}
