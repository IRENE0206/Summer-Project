import { UserInfoInterface } from "@/interfaces/Interfaces";
import Logout from "@/utils/Logout";

export default function UserMenu({ info }: { info: UserInfoInterface | null }) {
    return (
        <div>
            <button type="button">
                {info == null ? (
                    <p>Loading usermenu</p>
                ) : (
                    <div>{info.user_name}</div>
                )}
            </button>
            <Logout />
        </div>
    );
}
