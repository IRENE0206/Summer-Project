import { useEffect, useState } from "react";
import { UserInfoInterface } from "@/interfaces/Interfaces";

export default function UserInfo() {
    const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);
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
