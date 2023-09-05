import "bootstrap/dist/css/bootstrap.css";
import {WorkbookInterface} from "@/interfaces/Interfaces";
import {useEffect, useState} from "react";
import {Alert, Nav} from "react-bootstrap";
import Button from "react-bootstrap/Button";

export default function WorkbooksNavBar() {
    const api = "/api/workbooks";
    const [workbooks, setWorkbooks] = useState<WorkbookInterface[] | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    useEffect(() => {
        if (workbooks !== null) {
            return;
        }
        const fetchWorkbooks = async () => {
            const response = await fetch(api, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (!response.ok) {
                setErrorMsg(data.message);
                return;
            }

            // Check if the data is an array and has content
            if (data.length > 0) {
                setWorkbooks(data);
            } else {
                setWorkbooks([]);  // Set an empty array if no workbooks are available
            }
        };

        fetchWorkbooks().catch(e => console.log(e));
    }, [workbooks]);

    if (errorMsg !== null) {
        return (
            <Nav.Item className={"w-100 text-center px-3"}>
                <Alert variant={"danger"} className={"text-center"}> {/* Used Alert for better error visibility */}
                    Error loading workbooks: {errorMsg}
                </Alert>
            </Nav.Item>
        );
    } else if (workbooks === null) {
        return (
            <Nav.Item className={"w-100 text-center px-3"}>
                <Alert variant={"info"} className={"text-center shadow-sm"}>
                    Loading workbooks...
                </Alert>
            </Nav.Item>
        );
    } else if (workbooks.length === 0) {
        return (
            <Nav.Item className={"w-100 text-center px-3"}>
                <Alert variant={"info"} className={"text-center shadow-sm"}>
                    There is no workbook available yet.
                </Alert>
            </Nav.Item>
        );
    }
    return (
        workbooks.map((workbook) => (
            <Nav.Item key={workbook["workbook_id"]} className={"w-100 text-center"}>
                <Button
                    href={`/workbooks/${workbook["workbook_id"]}`}
                    variant="outline-primary"
                    type="button"
                    className={"px-3 text-center shadow-sm"}
                >
                    {workbook["workbook_name"]}
                </Button>
            </Nav.Item>
        ))
    );
}
