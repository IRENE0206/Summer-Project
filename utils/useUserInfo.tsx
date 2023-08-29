import {useEffect, useState} from "react";
import {UserInfoInterface} from "@/interfaces/Interfaces";

export default function useUserInfo() {
    console.log("Before useUserInfo useState calls");
    const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const api = "/api/user";

    useEffect(() => {
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Failed to fetch user info");
                }
                return res.json();
            })
            .then((data: UserInfoInterface) => {
                setUserInfo(data);
            })
            .catch((err) => {
                setError(new Error(err.message || "An unknown error occurred while fetching user info"));
            });
    }, []);
    return {userInfo, error};
}
