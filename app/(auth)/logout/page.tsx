"use client";
import Link from "next/link";
import {Container} from "react-bootstrap";
import Button from "react-bootstrap/Button";


export default function Logout() {
    return (
        <Container>
            <p>You have logged out</p>
            <Link href="/login">
                <Button>Click here to sign in</Button>
            </Link>
        </Container>
    );
}
