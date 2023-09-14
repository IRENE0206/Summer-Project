import {useEffect, useState} from "react";
import {ENCRYPTED_SESSION_IDENTIFIER} from "@/utils/constants";
import {UserInfoInterface, UserInterface} from "@/interfaces/Interfaces";
import {fetchAPI} from "@/utils/fetchAPI";

export const useUser = (): UserInterface => {
    const [user, setUser] = useState<UserInterface>({
        pass_auth: null,
        user_info: null,
        err_msg: null,
    });

    useEffect(() => {
        const authenticate = async () => {
            const AUTH_API = "/api/verify_session_identifier";

            const encryptedSessionIdentifier = localStorage.getItem(ENCRYPTED_SESSION_IDENTIFIER);

            if (!encryptedSessionIdentifier) {
                setUser({pass_auth: false, user_info: null, err_msg: "Session identifier not found."});
                return;
            }

            const authResult = await fetchAPI(AUTH_API, {
                method: "POST",
                headers: {
                    Authorization: encryptedSessionIdentifier,
                },
            });

            if (authResult.success) {
                const USER_INFO_API = "/api/user";
                const userInfoResult = await fetchAPI<undefined, UserInfoInterface>(USER_INFO_API);

                if (userInfoResult.success) {
                    setUser({pass_auth: true, user_info: userInfoResult.data as UserInfoInterface, err_msg: null});
                } else {
                    setUser({pass_auth: false, user_info: null, err_msg: userInfoResult.errorMessage || null});
                }
            } else {
                setUser({pass_auth: false, user_info: null, err_msg: authResult.errorMessage || null});
            }
        };

        // Run the authentication
        authenticate().catch(e => {
            setUser({pass_auth: false, user_info: null, err_msg: `An error occurred: ${e.message}`});
        });
    }, []);

    return user;
};
