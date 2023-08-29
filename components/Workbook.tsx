import {UserRole} from "@/interfaces/Interfaces";

export default function ({
    user_role,
    workbook_id
}: {
    user_role: UserRole,
    workbook_id: number
}) {
    const api = `/api/${user_role}/workbook/${workbook_id}`;

    return;
}