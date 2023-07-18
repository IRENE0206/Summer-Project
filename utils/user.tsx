import { UserInfo } from "@/interfaces/Interfaces";
import { useEffect, useState } from "react";

export default function User() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const api = "/api/user";
    useEffect(() => {
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => setUserInfo(data))
            .catch((error) => console.log(error));
    }, []);
    return userInfo;
}
