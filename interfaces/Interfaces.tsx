export interface WorkbookInterface {
    workbook_id: number;
    workbook_name: string;
    release_date: Date;
    last_edit: Date;
}

export interface UserInfoInterface {
    user_id: number;
    user_name: string;
    user_role: UserRole;
}

export enum UserRole {
    Admin = "admin",
    Regular = "regular",
}

export interface Line {
    line_index: number;
    variable: string;
    rules: string;
}
