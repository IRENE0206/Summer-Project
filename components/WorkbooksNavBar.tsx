import "bootstrap/dist/css/bootstrap.css";
import {WorkbookInterface} from "@/interfaces/Interfaces";
import {useEffect, useState} from "react";
import {Alert, Nav} from "react-bootstrap";
import Button from "react-bootstrap/Button";

export default function WorkbooksNavBar() {
    const api = "/api/workbooks";
    const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
    const [error, setError] = useState<Error | null>(null);
    useEffect(() => {
        fetch(api, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                console.log(res);
                if (res.ok) {
                    console.log("Workbooks fetch successful");
                    return res.json();
                } else {
                    console.log("Workbooks fetch failed");
                    throw new Error("Workbooks fetch failed");
                }
            })
            .then((data) => {
                console.log("Navbar");
                if (Array.isArray(data) && data.length > 0) {
                    setWorkbooks(data);
                } else {
                    setWorkbooks([]); // Set an empty array if no workbooks are available
                }
            })
            .catch((e) => {
                console.log(e);
                setError(new Error(e.message || "An unknown error occurred."));
            });
    }, []);

    if (error) {
        return (
            <Alert variant={"danger"} className={"text-center"}> {/* Used Alert for better error visibility */}
                Error loading workbooks: {error.message}
            </Alert>
        );
    }
    return (
        <Nav
            variant={"pills"}
            navbarScroll={true}
            className={"h-100 flex-column text-center"}
            justify
        >
            {workbooks && workbooks.length > 0 ? (
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
            ) : (
                <Nav.Item className={"w-100 text-center px-3"}>
                    <Alert variant={"info"} className={"text-center shadow-sm"}>
                        Loading workbooks...
                    </Alert>
                </Nav.Item>

            )}
        </Nav>
    );
}
