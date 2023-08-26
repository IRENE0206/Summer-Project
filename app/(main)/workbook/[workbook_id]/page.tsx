import Link from "next/link";
import NavLink from "react-bootstrap/NavLink";
export default function WorkbookMenu({
    params,
}: {
    params: {
        workbook_id: number;
    };
}) {
    return (
        <div>
            <NavLink href={`/${params.workbook_id}/edit`}>
                <button>Edit</button>
            </NavLink>
            <NavLink href={`/${params.workbook_id}/result`}>
                <button>Result</button>
            </NavLink>
        </div>
    );
}
