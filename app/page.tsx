"use client";
import UserAuth from "@/utils/UserAuth";
import { Container } from "react-bootstrap";

export default function Home() {
    // Authentification
    // if succeed, redirect to homepage
    // else redirect to login
    UserAuth("/home");

    return (
        <Container>
            <p>Loading...</p>
            <p>You need to sign in first</p>
        </Container>
    );
}
