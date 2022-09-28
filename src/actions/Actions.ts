import { ICommand, IRepData, IIssueInfo } from './Actions.types.js'
import * as router from '../router/Router.js'
import jiraAPI from '../jiraAPI/JiraAPI.js'
import { parseDate, empty } from '../utils/utils.js'
import config from '../config.json' assert { type: 'json' }
import chalk from 'chalk'
import { Answers } from 'inquirer'
import _ from 'lodash'

const jira = jiraAPI(config.jiraOpts)

// функция для логирования времени в ручном и авторежиме
export async function logTime(command: ICommand) {
    let answer: Answers
    if (empty(command.m)) {
        answer = await router.autoLogTime()
        Object.assign(answer, { type: 'auto', task: `MEDDEV-${answer.task}` })
    } else {
        answer = await router.manualLogTime()
        Object.assign(answer, { type: 'manual', task: `${answer.project}-${answer.task}` })
    }
    try {
        const status = await jira().postWorkLog(answer)
        if (status === 200) {
            console.log(chalk.green('Данные успешно добавлены!'))
            getReport()
        } else {
            throw new Error(`Ошибка при логировании времени (logTime): статус запроса (${status})`)
        }
    } catch(err) {
        console.error(chalk.red(err))
    }
}

// функция для получения отчетов
export async function getReport(command: ICommand = {}) {
    try {
        if (empty(command.m)) {
                const repData = await jira().getReport('log')
                if (+repData.status === 200) {
                    const resRepData = await repData.json()
                    const resultMap = new Map()
                    const results: Object[] = []
                    let sum = 0
                    resRepData.forEach(({ dateStarted, timeSpentSeconds }: IRepData) => {
                        const started = parseDate('forRead')(dateStarted)
                        if (!resultMap.has(started)) {
                            resultMap.set(started, +timeSpentSeconds / 3600)
                        } else {
                            resultMap.set(started, +resultMap.get(started) + (+timeSpentSeconds / 3600))
                        }
                    })
                    resultMap.forEach((value, key) => {
                        results.push({ date: key, hours: value < 8 || value > 8 ? `${value}` : value })
                        sum += value
                    })
                    results.push({ date: '----------', hours: sum })
                    console.table(results)
                } else {
                    throw new Error(`Ошибка при получении отчета по залогированному времени (getReport): статус запроса (${repData.status})`)
                }
        } else {
            const repData = await jira().getReport('my')
            if (+repData.status === 200) {
                const resRepData = await repData.json()
                const results: Object[] = []
                resRepData.issues.forEach((issue: IIssueInfo) => {
                    results.push({
                        key: issue.key,
                        summary: _.trim(_.truncate(issue.fields.summary, { length: 200, separator: '' })),
                        status: issue.fields.status.description
                    })
                })
                console.table(results)
            } else {
                throw new Error(`Ошибка при получении отчета по своим задачам (getReport): статус запроса (${repData.status})`)
            }
        }
    } catch (err) {
        console.error(chalk.red(err))
    }
}
