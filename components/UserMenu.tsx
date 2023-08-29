"use client";
import {UserInfoInterface} from "@/interfaces/Interfaces";
import {Container, Dropdown, Toast} from "react-bootstrap";
import {useState} from "react";

export default function UserMenu({info}: { info: UserInfoInterface | null }) {
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
                    {info == null ? (
                        <p>Loading user menu</p>
                    ) : (
                        <span>{info.user_name}</span>
                    )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item href="/logout" onClick={onClickHandler}>
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
