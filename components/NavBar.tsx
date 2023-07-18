import { Workbook } from "@/interfaces/Interfaces";
import { useEffect, useState } from "react";

export default function NavBar() {
    const api = "/api/workbooks";
    const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
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
        <div>
            <ul>
                {workbooks ? (
                    workbooks.map((workbook) => (
                        <li key={workbook["workbook_id"]}>
                            {workbook["workbook_name"]}
                        </li>
                    ))
                ) : (
                    <li>Loading workbooks...</li>
                )}
            </ul>
            <p>{workbooks.length}</p>
        </div>
    );
}
