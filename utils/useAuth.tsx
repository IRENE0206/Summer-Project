import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();

    useEffect(() => {
        const sessionIdentifier = localStorage.getItem("sessionIdentifier");
        if (!sessionIdentifier) {
            // Redirect to login page if the session identifier is not found
            router.push("/login");
        }
    }, [router]);
    console.log("auth");
}
