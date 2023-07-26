import "bootstrap/dist/css/bootstrap.css";
import { WorkbookInterface } from "@/interfaces/Interfaces";
import { useEffect, useState } from "react";
import NavLink from "react-bootstrap/NavLink";
import { Nav } from "react-bootstrap";

export default function NavBar() {
    const api = "/api/workbooks";
    const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(api, {
            method: "POST",
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
                setError(e);
            });
    }, []);

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
