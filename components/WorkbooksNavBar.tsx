import "bootstrap/dist/css/bootstrap.css";
import { WorkbookInterface } from "@/interfaces/Interfaces";
import { useEffect, useState } from "react";
import NavLink from "react-bootstrap/NavLink";
import { Nav } from "react-bootstrap";

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
                    <NavLink
                        key={workbook["workbook_id"]}
                        href={`/${workbook["workbook_id"]}/menu`}
                    >
                        <button>{workbook["workbook_name"]}</button>
                    </NavLink>
                ))
            ) : (
                <p>Loading workbooks...</p>
            )}

            <NavLink href="">WORKBOOK NAME</NavLink>

            <p>current workbook count: {workbooks.length}</p>
        </Nav>
    );
}
