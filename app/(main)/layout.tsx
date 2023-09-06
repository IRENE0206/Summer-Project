"use client";
import React, {createContext, useState} from "react";
import {UserInfoInterface} from "@/interfaces/Interfaces";
import Row from "react-bootstrap/Row";
import {Alert, Container, Navbar} from "react-bootstrap";
import Col from "react-bootstrap/Col";
import useAuth from "@/utils/useAuth";
import useUserInfo from "@/utils/useUserInfo";
import SideBar from "@/components/SideBar";
import OffCanvasContext from "@/utils/OffCanvasContext";

export const UserInfoContext = createContext<UserInfoInterface | null>(null);

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    const passAuth = useAuth();
    const {userInfo, error} = useUserInfo();
    console.log(userInfo);
    const [showOffCanvas, setShownOffCanvas] = useState<boolean>(true);

    const handleShowOffCanvas = () => {
        setShownOffCanvas(!showOffCanvas);
    };
    if (passAuth === null) {
        console.log("Authenticating");
        return (
            <Alert variant={"info"}>Loading...</Alert>
        );
    } else if (!passAuth) {
        console.error("Authentication failed");
        return (
            <Alert>
                You need to log in first.
            </Alert>
        );
    } else if (userInfo === null && error === null) {
        console.log("Fetching user information...");
        return (
            <Alert variant={"info"}>
                Fetching user information...
            </Alert>
        );
    } else if (error !== null) {
        console.error(error.message);
        return (
            <Alert variant={"danger"}>
                {error.message}
            </Alert>
        );
    }

    return (
        <Container fluid className={"p-0 m-0"}>
            <Row className={"w-100 py-3 px-0 mx-0"}>
                <Col className={"w-100 h-100 p-0 m-0"}>
                    <header>
                        <Navbar
                            bg={"dark"}
                            variant={"dark"}
                            expand={"md"}
                            fixed={"top"}  // Fixed Navbar
                            onToggle={handleShowOffCanvas}
                            className={"d-flex justify-content-between border-bottom border-dark-subtle shadow-sm"}
                        >
                            <Navbar.Toggle/>
                            <Navbar.Brand className={"mx-auto"}>WEBSITE NAME</Navbar.Brand>
                        </Navbar>
                    </header>
                </Col>
            </Row>
            <Row className={"w-100 mt-5 px-0 mx-0"}>
                <UserInfoContext.Provider value={userInfo}>
                    <Col md={3} lg={2} className={"ms-0 me-5 p-0 h-100"}>
                        <aside
                            className={"position-fixed start-0 top-0 pt-5 h-100 my-0"}>
                            <OffCanvasContext.Provider value={{showOffCanvas, handleShowOffCanvas}}>
                                <SideBar/>
                            </OffCanvasContext.Provider>
                        </aside>
                    </Col>
                    <Col className={"ps-md-5 h-100 ms-md-5"}>

                        <main className={"d-flex p-3"}>{children}</main>
                    </Col>
                </UserInfoContext.Provider>
            </Row>
        </Container>


    );
}
