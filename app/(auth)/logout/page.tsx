"use client";
import Link from "next/link";
import { Container } from "react-bootstrap";

export default function Logout() {
    return (
        <Container>
            <p>You have logged out</p>
            <Link href="/login">
                <button>Click here to sign in</button>
            </Link>
        </Container>
    );
}
