import Link from "next/link";
export default function WorkbookMenu({
    params,
}: {
    params: {
        workbook_id: number;
    };
}) {
    return (
        <div>
            <Link href={`/${params.workbook_id}/edit`}>
                <button>Edit</button>
            </Link>
            <Link href={`/${params.workbook_id}/result`}>
                <button>Result</button>
            </Link>
        </div>
    );
}
