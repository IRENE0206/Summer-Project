"use client";
import {Alert, Container, Dropdown, Toast} from "react-bootstrap";
import React, {useContext, useState} from "react";
import UserInfoContext from "@/utils/UserInfoContext";

export default function UserMenu() {
    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Container>
                <Alert variant="danger">
                    Failed to fetch user information. Please try again.
                </Alert>
            </Container>
        );
    }
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    async function onClickHandler() {
        localStorage.removeItem("sessionIdentifier");
        const api = "/api/logout";
        const res = await fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (res.ok) {
            console.log("Log out successful");
        } else {
            const data = await res.json();
            console.error("Log out failed", data);
            setShowToast(true);
            setToastMessage(data.message);
        }
    }

    return (
        <Container>
            <Dropdown drop={"up-centered"} align={"start"}>
                <Dropdown.Toggle variant="success" id="user-menu-dropdown">
                    <span>{userInfo.user_name}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item href="/" onClick={onClickHandler}>
                        Sign out
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Toast onClose={() => setShowToast(false)} show={showToast} autohide>
                <Toast.Header>
                    <strong className="mr-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </Container>
    );
}
