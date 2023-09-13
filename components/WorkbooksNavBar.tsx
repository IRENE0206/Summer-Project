"use client";
import {useEffect, useState} from "react";
import {Alert, Button, Nav} from "react-bootstrap";
import {WorkbookInterface} from "@/interfaces/Interfaces";
import CenteredSpinner from "@/components/CenteredSpinner";
import {fetchAPI} from "@/utils/fetchAPI";


export default function WorkbooksNavBar() {
    const api = "/api/workbooks";
    const [workbooks, setWorkbooks] = useState<WorkbookInterface[] | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    useEffect(() => {
        if (workbooks !== null) {
            return;
        }
        const fetchWorkbooks = async () => {
            const res = await fetchAPI<null, WorkbookInterface[]>(api, {method: "GET"});

            if (res.success) {
                setWorkbooks(res.data || []);
            } else {
                setErrorMsg(res.errorMessage || "An unexpected error occurred");
            }
        };

        fetchWorkbooks().catch(e => console.log(e));
    }, [workbooks]);

    if (errorMsg !== null) {
        return (
            <Nav.Item className={"w-100 p-0 m-0 text-center"}>
                <Alert variant={"danger"}
                    className={"rounded-5 text-center shadow-sm"}
                > {/* Used Alert for better error visibility */}
                    Error loading workbooks: {errorMsg}
                </Alert>
            </Nav.Item>
        );
    } else if (workbooks === null) {
        return (
            <CenteredSpinner/>
        );
    } else if (workbooks.length === 0) {
        return (
            <Nav.Item className={"w-100 p-0 m-0 text-center"}>
                <Alert variant={"info"} className={"rounded-5 text-center shadow-sm"}>
                    There is no workbook available yet.
                </Alert>
            </Nav.Item>
        );
    }
    return (
        <Nav
            variant={"pills"}
            navbarScroll={true}
            className={"w-100 h-100 p-0 m-0 d-flex flex-column"}
            justify
        >
            {
                workbooks.map((workbook) => (
                    <Nav.Item key={workbook["workbook_id"]} className={"w-100 p-0 m-0 text-center"}>
                        <Button
                            href={`/workbooks/${workbook["workbook_id"]}`}
                            variant={"outline-primary"}
                            type={"button"}
                            size={"lg"}
                            className={"w-100 rounded-5 text-center shadow-sm"}
                        >
                            {workbook["workbook_name"]}
                        </Button>
                    </Nav.Item>
                ))
            }
        </Nav>

    );
}
