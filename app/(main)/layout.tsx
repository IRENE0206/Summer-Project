"use client";
import React, {useState} from "react";
import {Alert, Col, Container, Navbar, Row} from "react-bootstrap";
import SideBar from "@/components/SideBar";
import OffCanvasContext from "@/utils/OffCanvasContext";
import {useUser} from "@/utils/useUser";
import UserInfoContext from "@/utils/UserInfoContext";
import Link from "next/link";
import CenteredSpinner from "@/components/CenteredSpinner";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    const user = useUser();
    const [showOffCanvas, setShownOffCanvas] = useState<boolean>(true);

    const handleShowOffCanvas = () => {
        setShownOffCanvas(!showOffCanvas);
    };
    if (user?.pass_auth === null) {
        console.log("Authenticating");
        return (
            <CenteredSpinner/>
        );
    }

    if (!user?.pass_auth || user?.err_msg !== null) {
        console.error("Authentication failed");
        return <Alert variant="danger">
            {user.err_msg || "Authentication failed."}
            Click <Link href={"/"}>here</Link> to sign in
        </Alert>;
    }
    if (user?.user_info === null) {
        console.log("Fetching user information...");

        return (
            <CenteredSpinner/>
        );
    }

    return (
        <Container fluid className={"d-grid p-0 m-0"}>

            <Row className={"d-grid w-100 py-3 px-3 mx-0"}>
                <Col className={"d-grid p-0 m-0"}>
                    <header>
                        <Navbar
                            bg={"dark"}
                            variant={"dark"}
                            expand={"md"}
                            fixed={"top"}  // Fixed Navbar
                            onToggle={handleShowOffCanvas}
                            className={"justify-content-between border-bottom border-light-subtle shadow"}
                        >
                            <Navbar.Toggle/>
                            <Navbar.Brand className={"mx-auto"}>WEBSITE NAME{/*TODO*/}</Navbar.Brand>
                        </Navbar>
                    </header>
                </Col>
            </Row>

            <Row className={"d-grid w-100 mt-5 px-3 mx-0"}>
                <UserInfoContext.Provider value={user.user_info}>
                    <Col className={"d-none d-md-flex flex-column m-0 mx-md-5 p-0 px-md-5"}>
                        <aside
                            className={"position-fixed start-0 top-0 pt-5 h-100 my-0"}>
                            <OffCanvasContext.Provider value={{showOffCanvas, handleShowOffCanvas}}>
                                <SideBar/>
                            </OffCanvasContext.Provider>
                        </aside>
                    </Col>

                    <Col className={"d-grid ps-md-5 h-100 ms-md-5"}>
                        <main className={"d-grid p-3"}>{children}</main>
                    </Col>
                </UserInfoContext.Provider>
            </Row>

        </Container>

    );
}
