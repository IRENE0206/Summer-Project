"use client";
import {Alert, Container, Dropdown, Nav, Toast} from "react-bootstrap";
import React, {useContext, useState} from "react";
import {SESSION_IDENTIFIER} from "@/utils/constants";
import {UserInfoContext} from "@/app/(main)/layout";

export default function UserMenu() {
    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Container className={"d-flex flex-column justify-content-end"}>
                <Alert variant="danger">
                    Failed to fetch user information. Please try again.
                </Alert>
            </Container>
        );
    }
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    async function onClickHandler() {
        localStorage.removeItem(SESSION_IDENTIFIER);
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
        <Nav.Item className={"px-3"}>
            <Dropdown
                className={"w-100"}
                data-bs-theme={"dark"}
                drop={"up-centered"}
                align={"start"}
            >
                <Dropdown.Toggle
                    variant={"success"}
                    id="user-menu-dropdown"
                    size={"lg"}
                    className={"shadow-sm w-100 text-center"}
                >
                    <span>{userInfo.user_name}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu align={"start"} className={"w-100"}>
                    <Dropdown.Item as={"button"} href="/" onClick={onClickHandler}>
                        Sign out
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                className={"bottom end w-100"}
                autohide
            >
                <Toast.Header>
                    <strong className="me-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </Nav.Item>

    );
}
