import * as router from '../router/Router.js'
import jiraAPI from '../jiraAPI/JiraAPI.js'
import GitExt from './git/GitExt.js'
import config from '../config.js'
import chalk from 'chalk'
import db from '../index.js'
import _ from 'lodash'
import { ICommand, IRepData, IIssueInfo } from './Actions.types.js'
import { parseDate, empty } from '../utils/utils.js'
import { Answers } from 'inquirer'
import { exec } from 'child_process'

const jira = jiraAPI(config.jiraOpts)

// функция для логирования времени в ручном и авторежиме
export async function logTime(command: ICommand) {
    let answer: Answers
    if (empty(command)) {
        answer = await router.logTimeWithBranch()
        await new Promise<void>(resolve => exec('git branch --show-current', (err, stdout) => {
            try {
                if (!empty(err)) {
                    throw new Error(`Ошибка при выполнении команды "git branch --show-current": ${err}`)
                }
                Object.assign(answer, { type: 'auto', task: stdout.split('_')[0] })
                resolve()
            } catch(err) {
                console.error(chalk.red(err))
            }
        }))
    } else if (command.p) {
        answer = await router.autoLogTime()
        Object.assign(answer, { type: 'auto', task: `MEDDEV-${answer.task}` })
    } else if (command.f) {
        answer = await router.manualLogTime()
        Object.assign(answer, { type: 'manual', task: `${answer.project}-${answer.task}` })
    }
    try {
        const status = await jira().postWorkLog(answer!)
        if (status === 200) {
            console.log(chalk.green('Данные успешно добавлены!'))
            await getReport()
            answer!.upd_task === 'Да' && updateTask(answer!.task)
        } else {
            throw new Error(`Ошибка при логировании времени (logTime): статус запроса (${status})`)
        }
    } catch(err) {
        console.error(chalk.red(err))
    }
}

// функция для обновления задач
export async function updateTask(task: string | undefined) {
    const answer: Answers = await router.updateTask(!empty(task))
    Object.assign(answer, {
        task: empty(task) ? `${answer.project}-${answer.task}` : task,
        performer: config.taskPerformers.find(user => user.name === answer.performer)!.login
    })
    try {
        const res = await jira().updateTask(answer) as [{ url: string, status: string }]
        const errors = res.map(r => {
            const action = _.last(r.url.split('/'))
            if (action === 'comment' && +r.status !== 201 || (action === 'transitions' || action === 'assignee') && +r.status !== 204) {
                return ` ${action}: (status: ${r.status})`
            }
        })
        if (!empty(errors)) {
            throw new Error(`Ошибка при обновлении задачи (updateTask): ${errors.join(' ')}`)
        } else {
            console.log(chalk.green('Данные успешно обновлены!'))
        }
    } catch(err) {
        console.error(chalk.red(err))
    }
}

// функция для получения отчетов
export async function getReport(command: ICommand = {}) {
    try {
        if (command.m) {
                const repData = await jira().getReport('log') as { status: string, json: () => Promise<IRepData[]> }
                if (+repData.status === 200) {
                    const resRepData = await repData.json()
                    const resultMap = new Map()
                    const results: Object[] = []
                    let sum = 0
                    resRepData.forEach(({ dateStarted, timeSpentSeconds }) => {
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
        } else if (command.w) {
            const answer: Answers = await router.myWorkReport()
            const date = empty(answer.date) ? parseDate('forRead')() : answer.date
            db.find({ date }, {}, (err, doc) => {
                if (!empty(err)) {
                    throw new Error(`Ошибка при поиске данных: ${err}`)
                }
                const results = doc.map(item => ({ task: `https://jira-medmis.bars.group/browse/${/.+/.exec(item.task)![0]}`, pushCount: item.pushCount }))
                console.log(date)
                console.table(results)
            })
        } else {
            const repData = await jira().getReport('my') as { status: string, json: () => Promise<{ issues: IIssueInfo[] }> }
            if (+repData.status === 200) {
                const resRepData = await repData.json()
                const results: Object[] = []
                resRepData.issues.forEach(issue => {
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

// отправка изменений в репозиторий
export async function overGit() {
    const git = new GitExt()
    exec('git status --short', async (err, stdout) => {
        try {
            if (!empty(err)) {
                throw new Error(`Ошибка при выполнении команды "git status --short": ${err}`)
            }
            console.log(stdout)
            const addAnswer: Answers = await router.overGit('add')
            if (addAnswer.addAll === 'Нет') {
                await (async function addRepeate() {
                    const { file, repeate }: Answers = await router.overGit('addFile')
                    empty(file) ? console.log('Значение не может быть пустым!') : (git.newFile = file)
                    repeate === 'Да' && await addRepeate()
                })()
            }
            const commentAnswer: Answers = await router.overGit('comment')
            exec('git branch --show-current', async (err, stdout) => {
                if (!empty(err)) {
                    throw new Error(`Ошибка при выполнении команды "git branch --show-current": ${err}`)
                }
                git.newBranch = stdout
                const taskCode = stdout.split('_')[0]
                const codeName = await jira().getIssueCodeName(taskCode)
                git.newComment = `${codeName!.replaceAll('"', '')} ${commentAnswer.comment}`
                git.gitAdd()
                const today = parseDate('forRead')()
                db.find({ $and: [{ task: taskCode }, { date: today }] }, {}, (err, doc) => {
                    if (!empty(err)) {
                        throw new Error(`Ошибка при поиске данных: ${err}`)
                    }
                    if (!empty(doc)) {
                        db.update({ $and: [{ task: taskCode }, { date: today }] }, { $set: { pushCount: doc[0].pushCount + 1 } }, {}, err => {
                            if (!empty(err)) {
                                throw new Error(`Ошибка при обновлении данных: ${err}`)
                            }
                        })
                    } else {
                        db.insert({ task: taskCode, pushCount: 1, date: today }, err => {
                            if (!empty(err)) {
                                throw new Error(`Ошибка при сохранении данных: ${err}`)
                            }
                        })
                    }
                })
            })
        } catch(err) {
            console.error(chalk.red(err))
        }
    })
}
