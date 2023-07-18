import { UserInfo } from "@/interfaces/Interfaces";

interface UserMenuProps {
    info: UserInfo | null;
}

export default function UserMenu({ info }: UserMenuProps) {
    return (
        <div>
            <button type="button">
                <div>
                    <div>
                        <span></span>
                    </div>
                </div>
                {info ? <div>{info.user_name}</div> : <p>Loading usermenu</p>}
            </button>
        </div>
    );
}
