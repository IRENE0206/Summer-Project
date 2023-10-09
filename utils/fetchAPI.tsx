interface FetchAPIOptions<T> {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: FetchAPIHeaders;
    body?: T;
}

interface FetchAPIResponse<R> {
    success: boolean;
    data?: R;
    errorMessage?: string;
}

interface FetchAPIHeaders {
    [key: string]: string;
}

export const fetchAPI = async <T, R>(
    url: string,
    options: FetchAPIOptions<T> = {}
): Promise<FetchAPIResponse<R>> => {
    const {method = "GET", headers = {}, body} = options;

    const fetchOptions: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    };

    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(url, fetchOptions);
        const data = await res.json();

        if (res.ok) {
            return {success: true, data};
        } else {
            return {success: false, errorMessage: data.message || "An error occurred while fetching data."};
        }
    } catch (error) {
        // Handle fetch or JSON parsing errors
        console.error("An unexpected error occurred in fetchAPI:", error); // Added logging
        return {success: false, errorMessage: "An unexpected error occurred."};
    }
};
