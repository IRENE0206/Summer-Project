/**
 * The root layout is a Server Component by default and can not be set to a Client Component.
 */
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
