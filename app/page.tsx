"use client";
import {Container} from "react-bootstrap";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();
    router.push("/home");
    return (
        <Container>
            <p>Loading...</p>
            <p>You need to sign in first</p>
        </Container>
    );
}
