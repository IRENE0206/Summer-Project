"use client";
import React, {useContext} from "react";
import {Alert, Button, Container, Offcanvas} from "react-bootstrap";
import WorkbooksNavBar from "@/components/WorkbooksNavBar";
import UserMenu from "@/components/UserMenu";
import OffCanvasContext from "@/utils/OffCanvasContext";
import UserInfoContext from "@/utils/UserInfoContext";
import {WEBSITE_NAME} from "@/utils/constants";


export default function SideBar() {
    const userInfo = useContext(UserInfoContext);
    const {showOffCanvas, handleShowOffCanvas} = useContext(OffCanvasContext);

    if (userInfo === null) {
        return (
            <Container>
                <Alert variant={"danger"} className={"text-center"}>
                    Failed to fetch user information.
                </Alert>
            </Container>
        );
    }
    const is_admin = userInfo?.is_admin || false;
    return (
        <Offcanvas
            backdrop={"static"}
            responsive={"md"}
            placement={"start"}
            show={showOffCanvas}
            onHide={handleShowOffCanvas}
            className={"d-flex flex-column h-100 p-0 m-0 bg-black shadow-lg"}
        >
            <Offcanvas.Header closeButton closeVariant={"white"} className={"bg-dark"}>
                <Offcanvas.Title className={"text-white"}>
                    {WEBSITE_NAME}
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body
                className={"px-0 pt-3 d-flex flex-column h-100"}
            >
                {is_admin ? (
                    <Container fluid
                        className={"d-flex justify-content-center border-bottom border-secondary py-3"}
                    >
                        <Button href={"/workbooks/new"} variant={"outline-primary"}
                            className={"rounded-5 w-100 shadow-sm"}
                            size={"lg"}
                        >
                            + New workbook
                        </Button>
                    </Container>

                ) : null}
                <Container fluid
                    className={"d-flex flex-column py-3 flex-grow-1"}
                >
                    <WorkbooksNavBar/>
                </Container>
                <Container fluid
                    className={"py-3 d-flex justify-content-center flex-grow-0 border-top border-secondary"}
                >
                    <UserMenu/>
                </Container>
            </Offcanvas.Body>
        </Offcanvas>

    );
}