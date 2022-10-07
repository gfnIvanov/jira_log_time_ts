import process from 'process'
import { IJiraInitOptions } from "./jiraAPI/JiraAPI.types"

type JTSConfig = {
    jiraOpts: IJiraInitOptions,
    workKind: string[],
    projects: string[],
    taskStatuses: string[],
    taskPerformers: { login: string, name: string }[],
}

const config: JTSConfig = {

    // опции для подключения к серверу Jira
    jiraOpts: {
        protocol: 'https',
        host: 'jira-medmis.bars.group',
        apiPath: 'rest/api/latest',
        workLogApiPath: 'rest/tempo-timesheets/4/worklogs',
        reportApiPath: 'rest/tempo-timesheets/3/worklogs',
        authOptions: {
            user: process.env.JIRA_LOGIN!,
            pass: process.env.JIRA_PASSWORD!
        }
    },

    // виды работы
    workKind: [
        'Разработка',
        'Собрания',
        'Код ревью',
        'Перенос',
        'Консультация',
        'Доработка'
    ],

    // проекты
    projects: [
        'MEDDEV',
        'MEDIMP',
        'MEDPM'
    ],

    // статусы задач
    taskStatuses: [
        'Текущий',
        'Взять в разработку',
        'На ревью',
        'К разработке',
        'К тестированию',
        'Вернуть на анализ',
        'В ожидание'
    ],

    // сотрудники, на которых будут переводиться задачи
    taskPerformers: [
        {
            login: '',
            name: 'Текущий'
        },
        {
            login: 'i.myasnikov',
            name: 'Иван Мясников'
        },
        {
            login: 'o.pavlova',
            name: 'Ольга Павлова'
        }
    ]
}

export default config
