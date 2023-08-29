"use client";
import WorkbooksNavBar from "@/components/WorkbooksNavBar";
import UserMenu from "@/components/UserMenu";
import useAuth from "@/utils/useAuth";
import React, {useState} from "react";
import {Button, Container, Nav, Navbar, Offcanvas, Row} from "react-bootstrap";
import useUserInfo from "@/utils/useUserInfo";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    console.log("Before useAuth");
    const passAuth = useAuth();

    console.log("Before useUserInfo");
    const {userInfo, error} = useUserInfo();


    console.log("Before useState in MainLayout");
    const [show, setShow] = useState(true);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setShow(true);
    };

    if (!passAuth) {
        return (<Container><p>You need to log in first</p></Container>);
    }
    if (error) {
        return (<Container><p>Error: {error.message}</p></Container>);
    }
    return (
        <Container>
            <header>
                <Navbar expand="sm" sticky="top">
                    <Container fluid>
                        <Navbar.Brand>WEBSITE NAME</Navbar.Brand>
                        <Navbar.Toggle onClick={show ? handleClose : handleShow}/>
                    </Container>
                </Navbar>
            </header>

            <div className="container-xxl bd-gutter bd-layout">
                <aside>
                    <Offcanvas
                        show={show}
                        onHide={handleClose}
                        bsPrefix="offcanvas"
                        backdrop={false}
                        keyboard={false}
                        scroll={true}
                        placement="start"
                        responsive="sm"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>WORKBOOKS</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Container fluid>
                                <Row>
                                    <Nav.Link href="/workbook/new">
                                        <Button variant="outline-primary">+ New workbook</Button>
                                    </Nav.Link>
                                </Row>
                                <Row>
                                    <WorkbooksNavBar/>
                                </Row>
                                <Row>
                                    <UserMenu info={userInfo}/>
                                </Row>
                            </Container>
                        </Offcanvas.Body>
                    </Offcanvas>
                </aside>
                <main className="bd-main">
                    {children}
                </main>
            </div>
        </Container>
    );
}
