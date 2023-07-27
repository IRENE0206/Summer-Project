"use client";
import { Container } from "react-bootstrap";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Container>
            <header>
                <h1>WEBSITE NAME</h1>
            </header>

            <main>{children}</main>
        </Container>
    );
}
