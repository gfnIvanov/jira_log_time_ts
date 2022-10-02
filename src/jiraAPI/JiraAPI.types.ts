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
    postWorkLog(options: Answers): Promise<number | undefined>,
    updateTask(fields: Answers): Promise<unknown>,
    getReport(type: string): Promise<unknown>
}

export interface IUniversalOptions {
    path: string,
    headers: HeadersInit,
    task?: string,
    user?: string
    value?: string
}

export interface IStatuses {
    transitions: { id: string, name: string }[]
}
