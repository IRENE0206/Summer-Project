import {useEffect, useState} from "react";
import {SECRET_KEY, SESSION_IDENTIFIER} from "@/utils/constants";
import CryptoJS from "crypto-js";
import {UserInfoInterface, UserInterface} from "@/interfaces/Interfaces";
import {fetchAPI} from "@/utils/fetchAPI";


export const useUser = (): UserInterface => {
    console.log("Before useUser useState calls");
    const [user, setUser] = useState<UserInterface>({
        pass_auth: null,
        user_info: null,
        err_msg: null,
    });
    useEffect(() => {
        const authenticate = async () => {
            const AUTH_API = "/api/verify_session_identifier";

            const encryptedSessionIdentifier = localStorage.getItem(SESSION_IDENTIFIER);

            if (!encryptedSessionIdentifier) {
                setUser({pass_auth: false, user_info: null, err_msg: "Session identifier not found."});
                return;
            }

            const decryptedSessionIdentifier = CryptoJS.AES.decrypt(
                encryptedSessionIdentifier,
                SECRET_KEY
            ).toString(CryptoJS.enc.Utf8);

            const authResult = await fetchAPI(AUTH_API, {
                method: "POST",
                headers: {
                    Authorization: decryptedSessionIdentifier,
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
