"use client";
import {Button, Container, NavLink} from "react-bootstrap";
import {UserRole} from "@/interfaces/Interfaces";

export default function WorkbookMenu({
    params,
}: {
    params: {
        user_role: UserRole,
        workbook_id: number,
    }
}) {
    return (
        <Container>
            {params.user_role === UserRole.Admin ? (
                <>
                    <NavLink href={`/workbook/${params.workbook_id}/edit`}>
                        <Button>Edit</Button>
                    </NavLink>
                    <NavLink href={`/workbook/${params.workbook_id}/result`}>
                        <Button>Result</Button>
                    </NavLink>
                </>

            ) : (
                <></>
            )}

        </Container>

    );
}
