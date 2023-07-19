export interface Workbook {
    workbook_id: number;
    workbook_name: string;
    release_date: Date;
    last_edit: Date;
}

export interface UserInfoInterface {
    user_id: number;
    user_name: string;
    user_role: string;
}
