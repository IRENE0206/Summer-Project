"use client";
import NavLink from "react-bootstrap/NavLink";
import {Container} from "react-bootstrap";
import Button from "react-bootstrap/Button";

export default function WorkbookMenu({
    params,
}: {
    params: {
        workbook_id: number;
    };
}) {
    return (
        <Container>
            <NavLink href={`/workbook/${params.workbook_id}/edit`}>
                <Button>Edit</Button>
            </NavLink>
            <NavLink href={`/workbook/${params.workbook_id}/result`}>
                <Button>Result</Button>
            </NavLink>
        </Container>
    );
}
