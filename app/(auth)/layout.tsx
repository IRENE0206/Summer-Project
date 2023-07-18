export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <header>
                <h1>WEBSITE NAME</h1>
            </header>

            <main>{children}</main>
        </>
    );
}
