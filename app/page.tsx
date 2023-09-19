"use client";

import {FormEvent, useState} from "react";

import {Button, Card, Col, Container, Form, InputGroup, Row, Tab, Tabs, Toast, ToastContainer} from "react-bootstrap";

import {ENCRYPTED_SESSION_IDENTIFIER, WEBSITE_NAME} from "@/utils/constants";
import {useRouter} from "next/navigation";


interface FormDataModel {
    user_name: string;
    password: string;
    repeat_password?: string;
}

const LOGIN_USERNAME = "login_username";
const LOGIN_PASSWORD = "login_password";
const REGISTER_USERNAME = "register_username";
const FIRST_PASSWORD = "first_password";
const REPEAT_PASSWORD = "repeat_password";


export default function Index() {
    const router = useRouter();
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>("");
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>, api: string, isRegistration: boolean = false) => {
        // Prevent the browser from reloading the page
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        let data: FormDataModel;

        if (isRegistration) {
            data = {
                user_name: formData.get("register_username") as string,
                password: formData.get("first_password") as string,
                repeat_password: formData.get("repeat_password") as string,
            };
            if (!data.user_name || !data.password || !data.repeat_password) {
                setToastMessage("All form fields are required");
                return;
            }
        } else {
            data = {
                user_name: formData.get(LOGIN_USERNAME) as string,
                password: formData.get(LOGIN_PASSWORD) as string,
            };
            if (!data.user_name || !data.password) {
                setToastMessage("All form fields are required");
                return;
            }
        }


        const res = await fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await res.json();
        if (!res.ok) {
            setToastMessage(responseData.message);
            setShowToast(true);
            console.error(toastMessage);
            return;
        }
        const encryptedSessionIdentifier = responseData[ENCRYPTED_SESSION_IDENTIFIER];
        if (!encryptedSessionIdentifier) {
            setToastMessage("Session identifier missing from server response.");
            console.error(toastMessage);
            return;
        }

        localStorage.setItem(
            ENCRYPTED_SESSION_IDENTIFIER,
            encryptedSessionIdentifier
        );
        router.push("/home");
    };

    const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        const LOGIN_API = "/api/login";
        await handleFormSubmit(e, LOGIN_API);
    };

    const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
        const REGISTER_API = "/api/register";
        await handleFormSubmit(e, REGISTER_API, true);
    };

    return (
        <Container fluid className={"p-5 d-grid justify-content-center align-items-center"}>
            <Row>
                <Col>
                    <Card
                        border={"light"}
                        className={"bg-success-subtle shadow-lg bg-primary-subtle rounded-5"}
                    >

                        <Card.Header className={"bg-dark shadow text-white rounded-top-5"}>
                            <Card.Title as={"h1"} className={"m-3 text-center"}>
                                {WEBSITE_NAME}
                            </Card.Title>
                        </Card.Header>

                        <Card.Body className={"d-flex flex-column m-3"}>
                            <ToastContainer position={"middle-center"}>
                                <Toast
                                    onClose={() => setShowToast(false)}
                                    show={showToast}
                                    bg={"warning"}
                                >
                                    <Toast.Header>
                                        <strong className="me-auto">Error</strong>
                                    </Toast.Header>
                                    <Toast.Body>{toastMessage}</Toast.Body>
                                </Toast>
                            </ToastContainer>

                            <Tabs
                                className={"shadow-lg"}
                                defaultActiveKey={"login"}
                                variant={"tabs"}
                                justify
                            >
                                <Tab
                                    eventKey={"login"}
                                    title={"Login"}
                                    className={"p-3 shadow-lg bg-light rounded-bottom-5"}
                                >
                                    <Form
                                        method={"post"}
                                        onSubmit={handleLoginSubmit}
                                        className={"d-flex flex-column"}
                                    >
                                        <Form.Group className={"m-3"}>
                                            <InputGroup>
                                                <Form.FloatingLabel label={"Username:"}>
                                                    <Form.Control
                                                        id={LOGIN_USERNAME}
                                                        name={LOGIN_USERNAME}
                                                        autoComplete={"username"}
                                                        required
                                                    />
                                                </Form.FloatingLabel>
                                                <InputGroup.Text>@bristol.ac.uk</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>

                                        <Form.Group className={"m-3"}>
                                            <Form.FloatingLabel label={"Password:"}>
                                                <Form.Control
                                                    id={LOGIN_PASSWORD}
                                                    name={LOGIN_PASSWORD}
                                                    type={"password"}
                                                    autoComplete={"current-password"}
                                                    required
                                                />
                                            </Form.FloatingLabel>
                                        </Form.Group>
                                        <Button
                                            variant={"success"}
                                            size={"lg"}
                                            type={"submit"}
                                            className={"m-3 rounded shadow"}
                                        >
                                            Sign In

                                        </Button>

                                    </Form>
                                </Tab>

                                <Tab
                                    eventKey={"register"}
                                    title={"Register"}
                                    className={"p-3 shadow-lg bg-light rounded-bottom-5"}
                                >

                                    <Form
                                        method={"post"}
                                        onSubmit={handleRegisterSubmit}
                                        className={"d-flex flex-column"}
                                    >

                                        <Form.Group className={"m-3"}>
                                            <InputGroup>
                                                <Form.FloatingLabel label={"Username:"}>
                                                    <Form.Control
                                                        id={REGISTER_USERNAME}
                                                        name={REGISTER_USERNAME}
                                                        autoComplete={"username"}
                                                        required
                                                    />
                                                </Form.FloatingLabel>
                                                <InputGroup.Text>@bristol.ac.uk</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>

                                        <Form.Group className={"m-3"}>
                                            <Form.FloatingLabel label={"Password:"}>
                                                <Form.Control
                                                    id={FIRST_PASSWORD}
                                                    name={FIRST_PASSWORD}
                                                    type={"password"}
                                                    autoComplete={"current-password"}
                                                    required
                                                />
                                            </Form.FloatingLabel>
                                        </Form.Group>

                                        <Form.Group className={"m-3"}>
                                            <Form.FloatingLabel label={"Confirm Password:"}>
                                                <Form.Control
                                                    id={REPEAT_PASSWORD}
                                                    name={REPEAT_PASSWORD}
                                                    type={"password"}
                                                    autoComplete={"current-password"}
                                                    required
                                                />
                                            </Form.FloatingLabel>
                                        </Form.Group>

                                        <Button
                                            variant={"success"}
                                            type={"submit"}
                                            size={"lg"}
                                            className={"m-3 shadow-sm rounded"}
                                        >
                                            Register
                                        </Button>
                                    </Form>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
