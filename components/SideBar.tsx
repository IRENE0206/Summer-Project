"use client";
import {UserRole} from "@/interfaces/Interfaces";
import {Alert, Button, Container, Nav, Navbar, Offcanvas, Row} from "react-bootstrap";
import WorkbooksNavBar from "@/components/WorkbooksNavBar";
import UserMenu from "@/components/UserMenu";
import React, {useContext, useState} from "react";
import UserInfoContext from "@/utils/UserInfoContext";

export default function SideBar() {
    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Container>
                <Alert variant="danger">
                    Failed to fetch user information. Please try again.
                </Alert>
            </Container>
        );
    }
    const user_role = userInfo.user_role;
    const [show, setShow] = useState(true);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setShow(true);
    };
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
                            {user_role == UserRole.Admin ? (<Row>
                                <Nav.Link href="/workbooks/new">
                                    <Button variant="outline-primary">+ New workbook</Button>
                                </Nav.Link>
                            </Row>) : (<></>)}

                            <Row>
                                <WorkbooksNavBar/>
                            </Row>
                            <Row>
                                <UserMenu/>
                            </Row>
                        </Container>
                    </Offcanvas.Body>
                </Offcanvas>
            </aside>
        </Container>
    );
}