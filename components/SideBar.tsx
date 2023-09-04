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
            backdrop={"static"}
            responsive={"md"}
            placement={"start"}
            show={showOffCanvas}
            onHide={handleShowOffCanvas}
            className={"h-100 p-0 m-0 bg-black shadow-lg"}
        >
            <Offcanvas.Header closeButton closeVariant={"white"} className={"bg-dark"}>
                <Offcanvas.Title className={"text-white"}>WEBSITE NAME</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body
                className={"px-0 py-3 d-flex flex-column h-100"}>
                {user_role === UserRole.Admin ? (
                    <Container fluid
                        className={"p-0 flex-grow-0 text-center border-bottom border-secondary pb-3"}>
                        <Nav.Item className={"px-3"}>
                            <Button href="/workbooks/new" variant="outline-primary" className={"w-100 shadow-sm"}
                                size={"lg"}>
                                + New workbook
                            </Button>
                        </Nav.Item>
                    </Container>

                ) : null}
                <Container fluid className={"p-0 text-center flex-grow-1 my-3"}>
                    <WorkbooksNavBar/>
                </Container>
                <Container fluid className={"p-0 text-center flex-grow-0 pt-3 border-top border-secondary"}>
                    <UserMenu/>
                </Container>

            </Offcanvas.Body>
        </Offcanvas>

    );
}