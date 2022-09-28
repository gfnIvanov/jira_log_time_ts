import { Answers } from "inquirer";

export interface IJiraInitOptions {
    protocol: string,
    host: string,
    apiPath: string,
    workLogApiPath: string,
    reportApiPath: string,
    authOptions: {
        user: string,
        pass: string
    };
}

export interface IJiraInstanceObject {
    postWorkLog(options: Answers): Promise<number | undefined>
    getReport(options: string): Promise<any>
}
