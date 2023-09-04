"use client";
import useAuth from "@/utils/useAuth";
import React, {useState} from "react";
import {Container, Navbar} from "react-bootstrap";
import useUserInfo from "@/utils/useUserInfo";
import SideBar from "@/components/SideBar";
import UserInfoContext from "@/utils/UserInfoContext";
import Col from "react-bootstrap/Col";
import OffCanvasContext from "@/utils/OffCanvasContext";
import Row from "react-bootstrap/Row";

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
    if (!passAuth) {
        return (<Container><p>You need to log in first</p></Container>);
    } else if (!userInfo) {
        return (<Container><p>Failed to fetch user information</p></Container>);
    } else if (error) {
        return (<Container><p>Error: {error.message}</p></Container>);
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
            <Row className={"w-100 mt-5 px-0 mx-0"}> {/* Added mt-5 to offset the content below the fixed navbar */}
                <UserInfoContext.Provider value={userInfo}>
                    {/* Sidebar */}
                    <Col md={3} lg={2} className={"ms-0 me-3 p-0 h-100"}>
                        <aside
                            className={"position-fixed start-0 top-0 pt-5 h-100 my-0"}>
                            <OffCanvasContext.Provider value={{showOffCanvas, handleShowOffCanvas}}>
                                <SideBar/>
                            </OffCanvasContext.Provider>
                        </aside>
                    </Col>
                    {/* Main Content */}
                    <Col className={"p-0 h-100 ms-md-5"}>
                        <main className={"d-flex p-3"}>{children}</main>
                    </Col>
                </UserInfoContext.Provider>
            </Row>
        </Container>
    );
}
