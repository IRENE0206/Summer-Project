import {UserRole} from "@/interfaces/Interfaces";
import {Alert} from "react-bootstrap";

export default function EditWorkbook({
    params
}: {
    params: {
        user_role: UserRole,
        workbook_id: number,
    }
}) {
    if (params.user_role !== UserRole.Admin) {
        return (
            <Alert variant="danger">
                You do not have permission to access this page.
            </Alert>
        );
    }
    return (
        <div>
            <p>Edit workbook</p>
        </div>
    );
}
