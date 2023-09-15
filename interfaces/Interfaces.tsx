export interface WorkbookInterface {
    workbook_id: number;
    workbook_name: string;
    release_date: Date;
}

export interface UserInfoInterface {
    user_id: number;
    user_name: string;
    is_admin: boolean;
}

export interface UserInterface {
    pass_auth: boolean | null;
    user_info: UserInfoInterface | null;
    err_msg: string | null;
}

export interface Line {
    line_index: number;
    variable: string;
    rules: string;
}


export interface ExerciseDataInterface {
    exercise_id: number,
    exercise_index: number,
    exercise_number: string,
    exercise_content: string,
    lines: Line[],
}

export interface WorkbookDataInterface {
    workbook_name: string,
    release_date: string,
    exercises: ExerciseDataInterface[],
}