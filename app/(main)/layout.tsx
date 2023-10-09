"use client";
import React, {useState} from "react";
import Link from "next/link";
import {Alert, Col, Container, Navbar, Row} from "react-bootstrap";
import SideBar from "@/components/SideBar";
import CenteredSpinner from "@/components/CenteredSpinner";
import {useUser} from "@/utils/useUser";
import OffCanvasContext from "@/utils/OffCanvasContext";
import UserInfoContext from "@/utils/UserInfoContext";
import {WEBSITE_NAME} from "@/utils/constants";

export default function MainLayout({children}: { children: React.ReactNode }) {
    const user = useUser();
    const [showOffCanvas, setShownOffCanvas] = useState<boolean>(true);

    const handleShowOffCanvas = () => {
        setShownOffCanvas(!showOffCanvas);
    };

    // Authentication & User Information Loading
    if (user?.pass_auth === null || user?.user_info === null) {
        return <CenteredSpinner/>;
    }

    // Authentication Failure Handling
    if (!user?.pass_auth || user?.err_msg !== null) {
        console.error("Authentication failed");
        return (
            <Alert variant="danger">
                {user.err_msg || "Authentication failed."} Click <Link href={"/"}>here</Link> to sign in.
            </Alert>
        );
    }

    return (
        <Container fluid className={"d-grid p-0 m-0"}>
            <Row className={"w-100 py-3"}>
                <Col>
                    <header>
                        <Navbar
                            bg={"dark"}
                            variant={"dark"}
                            expand={"md"}
                            fixed={"top"}
                            onToggle={handleShowOffCanvas}
                            className={"justify-content-between border-bottom border-light-subtle shadow"}
                        >
                            <Navbar.Toggle/>
                            <Navbar.Brand className={"mx-auto"} href={"/home"}>{WEBSITE_NAME}</Navbar.Brand>
                        </Navbar>
                    </header>
                </Col>
            </Row>

            <Row className={"w-100 py-5"}>
                <UserInfoContext.Provider value={user.user_info}>
                    <Col md={3} className={"d-none d-md-flex flex-column"}>
                        <aside className={"position-fixed start-0 top-0 pt-5 h-100 my-0"}>
                            <OffCanvasContext.Provider value={{showOffCanvas, handleShowOffCanvas}}>
                                <SideBar/>
                            </OffCanvasContext.Provider>
                        </aside>
                    </Col>
                    <Col>
                        <main>{children}</main>
                    </Col>
                </UserInfoContext.Provider>
            </Row>
        </Container>
    );
}

