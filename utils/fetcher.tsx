export default async function Fetcher(
    url: string,
    method: string = "",
    body: any = undefined
) {
    return fetch(url, { method: method, body: body }).then((res) => res.json());
}
