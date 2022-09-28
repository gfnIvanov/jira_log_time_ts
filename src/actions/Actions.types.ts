export interface ICommand {
    [x: string]: boolean
}

export interface IRepData {
    dateStarted: string,
    timeSpentSeconds: string
}

export interface IIssueInfo {
    key: string,
    fields: {
        summary: string,
        status: {
            description: string
        }
    }
}