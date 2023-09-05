export interface WorkbookInterface {
    workbook_id: number;
    workbook_name: string;
    release_date: Date;
    last_edit: Date;
}

export interface UserInfoInterface {
    user_id: number;
    user_name: string;
    is_admin: boolean;
}

export interface Line {
    line_index: number;
    variable: string;
    rules: string;
}

export interface QAInterface {
    id: number,
    index: number,
    number: string,
    question: string,
    answer: Line[]
}

