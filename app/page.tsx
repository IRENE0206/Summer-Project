"use client";
import {Button, Card, Container, Form, InputGroup, Tab, Tabs} from "react-bootstrap";
import {useRouter} from "next/navigation";
import {FormEvent} from "react";
import CryptoJS from "crypto-js";

interface FormDataModel {
    username: string;
    password: string;
    repeat_password?: string;
}

export default function Index() {
    const router = useRouter();

    async function handleFormSubmit(e: FormEvent<HTMLFormElement>, api: string, isRegistration: boolean = false) {
        // Prevent the browser from reloading the page
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        let data: FormDataModel;

        if (isRegistration) {
            data = {
                username: formData.get("register_username") as string,
                password: formData.get("first_password") as string,
                repeat_password: formData.get("repeat_password") as string,
            };
            if (!data.username || !data.password || !data.repeat_password) {
                console.log("All form fields are required");
                return;
            }
        } else {
            data = {
                username: formData.get("login_username") as string,
                password: formData.get("login_password") as string,
            };
            if (!data.username || !data.password) {
                console.log("All form fields are required");
                return;
            }
        }

        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(async (res) => {
                const responseData = await res.json();
                if (!res.ok) {
                    throw new Error(responseData.message || "Unknown Error");

                }
                const sessionIdentifier = responseData["session_identifier"];
                if (!sessionIdentifier) {
                    console.error("Session identifier missing from server response.");
                    return;
                }
                console.log("sessionIdentifier " + sessionIdentifier);
                const encryptedSessionIdentifier = CryptoJS.AES.encrypt(
                    sessionIdentifier,
                    "secretKey"
                ).toString();
                console.log("encryptedSessionIdentifier " + encryptedSessionIdentifier);
                localStorage.setItem(
                    "sessionIdentifier",
                    encryptedSessionIdentifier
                );
                console.log("Login successful. Now direct to '/home");
                // Redirect to homepage if login is successful
                router.push("/home");
            })
            .catch((error) => {
                console.error(error);
            });

    }

    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        const api = "/api/login";
        // pass data as a fetch body
        await handleFormSubmit(e, api);
    }

    async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
        const api = "/api/register";
        await handleFormSubmit(e, api, true);
    }

    return (
        <Container>
            <Card>
                <Card.Header>
                    WEBSITE NAME {/* TODO: */}
                </Card.Header>
                <Card.Body>
                    <Tabs
                        defaultActiveKey={"login"}
                    >
                        <Tab
                            eventKey={"login"}
                            title={"Login"}
                        >
                            <Form method="post" onSubmit={handleLoginSubmit}>
                                <Form.Group>
                                    <Form.Label>Email address</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            id="login_username"
                                            name="login_username"
                                            type="search"
                                            autoComplete="username"
                                            placeholder="You UoB username"
                                            required
                                        />
                                        <InputGroup.Text>@bristol.ac.uk</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Password</Form.Label>

                                    <Form.Control
                                        id="login_password"
                                        name="login_password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </Form.Group>

                                <Button type="submit">Sign In</Button>
                            </Form>
                        </Tab>

                        <Tab
                            eventKey={"register"}
                            title={"Register"}
                        >
                            <Form method="post" onSubmit={handleRegisterSubmit}>
                                <Form.Group>
                                    <Form.Label>Email address</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            id="register_username"
                                            name="register_username"
                                            type="search"
                                            autoComplete="username"
                                            placeholder="You UoB username"
                                            required
                                        />
                                        <InputGroup.Text>@bristol.ac.uk</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Password</Form.Label>

                                    <Form.Control
                                        id="first_password"
                                        name="first_password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Confirm Password</Form.Label>

                                    <Form.Control
                                        id="repeat_password"
                                        name="repeat_password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </Form.Group>

                                <Button type="submit">Register</Button>

                            </Form>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
}
