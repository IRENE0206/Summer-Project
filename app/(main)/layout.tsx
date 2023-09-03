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
        <UserInfoContext.Provider value={userInfo}>
            <Container>
                <Row>
                    <header>
                        <Navbar
                            variant={"dark"}
                            expand={"sm"}
                            sticky={"top"}
                            onToggle={handleShowOffCanvas}
                        >
                            <Col><Navbar.Toggle/></Col>
                            <Col><Navbar.Brand>WEBSITE NAME{/*TODO*/}</Navbar.Brand></Col>
                            <Col></Col>
                        </Navbar>
                    </header>
                </Row>

                <Row>
                    <Col sm={4}>
                        <OffCanvasContext.Provider value={{showOffCanvas, handleShowOffCanvas}}>
                            <SideBar/>
                        </OffCanvasContext.Provider>

                    </Col>
                    <Col sm={8}>
                        <main>{children}</main>
                    </Col>
                </Row>

            </Container>

        </UserInfoContext.Provider>
    );
}
