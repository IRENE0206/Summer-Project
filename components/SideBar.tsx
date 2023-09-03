"use client";
import {UserRole} from "@/interfaces/Interfaces";
import {Alert, Button, Container, Nav, Offcanvas} from "react-bootstrap";
import WorkbooksNavBar from "@/components/WorkbooksNavBar";
import UserMenu from "@/components/UserMenu";
import React, {useContext} from "react";
import UserInfoContext from "@/utils/UserInfoContext";
import OffCanvasContext from "@/utils/OffCanvasContext";

export default function SideBar() {
    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Container>
                <Alert variant="danger" className={"text-center"}>
                    Failed to fetch user information. Please try again.
                </Alert>
            </Container>
        );
    }
    const user_role = userInfo.user_role;
    const {showOffCanvas, handleShowOffCanvas} = useContext(OffCanvasContext);
    return (
        <Offcanvas
            backdrop={false}
            scroll={true}
            responsive={"sm"}
            placement={"start"}
            show={showOffCanvas}
            onHide={handleShowOffCanvas}
            className={"d-flex flex-column"}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>WEBSITE NAME{/*TODO*/}</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
                <Container fluid className={"m-3"}>
                    <Nav
                        variant={"pills"}
                        navbarScroll={true}
                        className={"flex-column align-items-center mb-3"}
                        justify
                    >
                        {user_role === UserRole.Admin ? (
                            <Nav.Item>
                                <Nav.Link href="/workbooks/new">
                                    <Button variant="outline-primary">+ New workbook</Button>
                                </Nav.Link>
                            </Nav.Item>

                        ) : (<></>)}
                        <WorkbooksNavBar/>
                        <UserMenu/>
                    </Nav>
                </Container>
            </Offcanvas.Body>
        </Offcanvas>
    );
}