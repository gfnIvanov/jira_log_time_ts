import fetch from "node-fetch"
import chalk from 'chalk'
import { IJiraInitOptions, IJiraInstanceObject, IStatuses, IUniversalOptions } from "./JiraAPI.types.js"
import { empty, parseDate } from '../utils/utils.js'
import { Answers } from "inquirer"

export default function jiraAPI(options: IJiraInitOptions): () => IJiraInstanceObject {
    const {
        protocol,
        host,
        apiPath,
        workLogApiPath,
        reportApiPath,
        authOptions
    } = options

    const hostname = `${protocol}://${host}`

    const headersConstraints = {
        writable: false,
        enumerable: true,
        configurable: false
    }

    const headers = Object.defineProperties({}, {
        'Authorization': {
            value: `Basic ${Buffer.from(`${authOptions.user}:${authOptions.pass}`).toString('base64')}`,
            ...headersConstraints
        },
        'Accept': {
            value: 'application/json',
            ...headersConstraints
        },
        'Content-Type': {
            value: 'application/json;charset=UTF-8',
            ...headersConstraints
        }
    })

    return () => ({

        // логирование времени
        async postWorkLog(options: Answers) {
            try {
                const [issue, user] = await Promise.all([
                    getIssueInfo({ path: `${hostname}/${apiPath}`, headers, task: options.task }),
                    getUserInfo({ path: `${hostname}/${apiPath}`, headers, user: authOptions.user })
                ])
                if (+issue.status !== 200 || +user.status !== 200) {
                    throw new Error(`Статус запроса: getIssueInfo (${issue.status}), getUserInfo (${user.status})`)
                }
                const [issueData, userData] = await Promise.all([
                    issue.json() as Promise<{ id: string }>,
                    user.json() as Promise<{ key: string }>
                ])
                const fetchOptions = {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        attributes: {
                            _Видработ_: {
                                name: 'Вид работ',
                                value: options.action,
                                workAttributeId: 2,
                            },
                        },
                        comment: options.comment,
                        originTaskId: issueData.id,
                        started: parseDate('forJira')(options.date),
                        timeSpentSeconds: options.time * 3600,
                        worker: userData.key
                    })
                }
                return fetch(`${hostname}/${workLogApiPath}`, fetchOptions).then(res => res.status)
            } catch(err) {
                console.error(chalk.red('Ошибка при запросе данных (postWorkLog):'), err)
            }
        },

        // обновление задачи
        async updateTask(fields) {
            const actions = []
            const options = {
                path: `${hostname}/${apiPath}`,
                headers, task:
                fields.task
            }
            try {
                !empty(fields.comment) && actions.push(setComment(Object.assign(options, { value: fields.comment })))
                fields.status !== 'Текущий' && actions.push(setStatus(Object.assign(options, { value: fields.status })))
                fields.performer !== 'Текущий' && actions.push(setPerformer(Object.assign(options, { value: fields.performer })))
                if (actions.length > 0) {
                    return Promise.all(actions).then(res => res)
                }
            } catch(err) {
                console.error(chalk.red('Ошибка при обновлении данных (updateTask):'), err)
            }
        },

        // получение отчетов
        async getReport(type: 'log' | 'my') {
            try {
                if (type === 'log') {
                    const dateFrom = parseDate('forJira')().split('-').map((el, i) => i === 2 ? '01' : el).join('-')
                    return fetch(`${hostname}/${reportApiPath}/?username=${authOptions.user}&dateFrom=${dateFrom}`, { method: 'GET', headers })
                } else {
                    const fetchOptions = {
                        method: 'POST',
                        headers,
                        body: `{
                            "jql": "project = \'Производство МИС / ЛИС\' \
                                                AND assignee = ${authOptions.user} \
                                                AND status in (Open, \'Under Review\', \'In dev\', \'To dev\', \'To Migration\', Migration) \
                                                OR issuekey = MEDDEV-5351 ORDER BY status",
                            "fields": ["summary", "status"]
                        }`
                    }
                    return fetch(`${hostname}/${apiPath}/search`, fetchOptions)
                }
            } catch(err) {
                console.error(chalk.red('Ошибка при запросе данных (getReport):'), err)
            }
        }
    })
}

// получение ключа таска
function getIssueInfo({ path, headers, task }: IUniversalOptions) {
    return fetch(`${path}/issue/${task}`, { method: 'GET', headers })
}

// получение ключа пользователя
function getUserInfo({ path, headers, user }: IUniversalOptions) {
    return fetch(`${path}/user/?username=${user}`, { method: 'GET', headers })
}

// добавление комментария
function setComment({ path, headers, task, value }: IUniversalOptions) {
    const fetchOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            body: value
        })
    }
    return fetch(`${path}/issue/${task}/comment`, fetchOptions)
}

// изменение статуса
async function setStatus({ path, headers, task, value }: IUniversalOptions) {
    try {
        const res = await fetch(`${path}/issue/${task}/transitions`, { method: 'GET', headers })
        if (+res.status !== 200) {
            throw new Error(`Статус запроса: transitions (${res.status})`)
        }
        const statuses = await res.json() as IStatuses
        const currentStatus = statuses.transitions.find(t => t.name === value)
        if (empty(currentStatus)) {
            throw new Error('Нельзя перевести задачу в выбранный статус!')
        }
        const fetchOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                transition: {
                    id: currentStatus!.id
                }
            })
        }
        return fetch(`${path}/issue/${task}/transitions`, fetchOptions)
    } catch(err) {
        console.error(chalk.red('Ошибка при установке статуса (updateTask):'), err)
    }
}

// измнение исполнителя
function setPerformer({ path, headers, task, value }: IUniversalOptions) {
    const fetchOptions = {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            name: value
        })
    }
    return fetch(`${path}/issue/${task}/assignee`, fetchOptions)
}
