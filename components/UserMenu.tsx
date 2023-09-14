"use client";
import React, {useContext, useState} from "react";
import {Alert, Dropdown, Toast, ToastContainer} from "react-bootstrap";
import {SESSION_IDENTIFIER} from "@/utils/constants";
import UserInfoContext from "@/utils/UserInfoContext";
import {fetchAPI} from "@/utils/fetchAPI";


export default function UserMenu() {
    const userInfo = useContext(UserInfoContext);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    if (userInfo === null) {
        return (
            <Alert variant={"danger"}>
                Failed to get user information.
            </Alert>
        );
    }

    const onClickHandler = async () => {
        localStorage.removeItem(SESSION_IDENTIFIER);
        const api = "/api/logout";
        const res = await fetchAPI(api, {method: "POST"});
        if (res.success) {
            console.log("Log out successful");
        } else {
            setShowToast(true);
            setToastMessage(res.errorMessage || "An unexpected error occurred.");
        }
    };

    return (
        <Dropdown
            className={"d-flex flex-column justify-content-center align-items-center w-100 shadow-sm rounded-5"}
            data-bs-theme={"dark"}
            drop={"up-centered"}
            align={"start"}
        >
            <ToastContainer position={"middle-center"}>
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    className={"rounded-5 bottom end"}
                    bg={"warning"}
                >
                    <Toast.Header closeVariant={"white"}>
                        <strong className={"me-auto"}>Error</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Dropdown.Toggle
                variant={"success"}
                id={"user-menu-dropdown"}
                size={"lg"}
                className={"rounded-5 shadow-sm w-100 text-center"}
            >
                <span>{userInfo.user_name}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu align={"start"} className={"w-100 text-center"}>
                <Dropdown.Item href="/" onClick={onClickHandler}>
                    Sign out
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
