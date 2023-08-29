import "bootstrap/dist/css/bootstrap.css";
import {WorkbookInterface} from "@/interfaces/Interfaces";
import {useEffect, useState} from "react";
import {Nav} from "react-bootstrap";
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
        return <p>Error loading workbooks: {error.message}</p>;
    }
    return (
        <Nav
            variant="pills"
            navbarScroll={true}
            className="justify-content-end flex-column"
        >
            {workbooks ? (
                workbooks.map((workbook) => (
                    <Nav.Item key={workbook["workbook_id"]}>
                        <Nav.Link
                            href={`/workbook/${workbook["workbook_id"]}`}
                        >
                            <Button
                                variant="outline-primary"
                                type="button"
                            >
                                {workbook["workbook_name"]}
                            </Button>
                        </Nav.Link>
                    </Nav.Item>


                ))
            ) : (
                <p>Loading workbooks...</p>
            )}

            <Nav.Link href="">WORKBOOK NAME</Nav.Link>

            <p>current workbook count: {workbooks.length}</p>
        </Nav>
    );
}
