import Link from "next/link";
export default function Workbook({
    params,
}: {
    params: {
        workbook_name: string;
        workbook_id: number;
        user_role: string;
    };
}) {
    return (
        <>
            {params.user_role === "admin" ? (
                <Link href={`/${params.workbook_name}/edit`}>
                    <a>
                        <button>Edit</button>
                    </a>
                </Link>
            ) : (
                <p>Not allowed to edit</p>
            )}
        </>
    );
}
