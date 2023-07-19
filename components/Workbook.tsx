import Link from "next/link";

interface WorkbookProps {
    id: number;
    name: string;
}

export function Workbook({ id, name }: WorkbookProps) {
    return (
        <li>
            <Link href="/workbook/edit">
                <button type="button">{name}</button>
            </Link>
            <button
                data-bs-toggle="collapse"
                data-bs-target="#home-collapse"
                aria-expanded="false"
            >
                Home
            </button>
            <div id="home-collapse">
                <ul>
                    <li>
                        <button></button>
                    </li>
                    <li>
                        <a href="#">Updates</a>
                    </li>
                    <li>
                        <a href="#">Reports</a>
                    </li>
                </ul>
            </div>
        </li>
    );
}

function WorkbookEdit(id?: number) {}
