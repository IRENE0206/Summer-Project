import {createContext} from "react";
import {UserInfoInterface} from "@/interfaces/Interfaces";

const UserInfoContext = createContext<UserInfoInterface | null>(null);

export default UserInfoContext;