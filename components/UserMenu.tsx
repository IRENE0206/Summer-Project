import { UserInfoInterface } from "@/interfaces/Interfaces";
import Dropdown from "react-bootstrap/Dropdown";

export default function UserMenu({ info }: { info: UserInfoInterface | null }) {
    function onClickHandler() {
        localStorage.removeItem("sessionIdentifier");
        const api = "/api/logout";
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.ok) {
                    console.log("Log out successful");
                } else {
                    throw new Error("Logout failed");
                }
            })
            .catch((error) => console.log("Log out failed"));
    }
    return (
        <Dropdown drop={"up-centered"} align={"start"}>
            <Dropdown.Toggle variant="success" id="user-menu-dropdown">
                {info == null ? (
                    <p>Loading usermenu</p>
                ) : (
                    <span>{info.user_name}</span>
                )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item href="/logout" onClick={onClickHandler}>
                    Sign out
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
