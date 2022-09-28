import fetch from "node-fetch"
import chalk from 'chalk'
import { IJiraInitOptions, IJiraInstanceObject } from "./JiraAPI.types.js"
import { parseDate } from '../utils/utils.js'
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
        async postWorkLog(options: Answers): Promise<number | undefined> {
            try {
                const [issue, user] = await Promise.all([
                    getIssueInfo(`${hostname}/${apiPath}`, headers, options.task),
                    getUserInfo(`${hostname}/${apiPath}`, headers, authOptions.user)
                ])
                if (+issue.status !== 200 || +user.status !== 200) {
                    throw new Error(`Статус запроса: getIssueInfo (${issue[0]}), getUserInfo (${user[0]})`)
                }
                const [issueData, userData] = await Promise.all([issue.json(), user.json()])
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

        // получение отчетов
        async getReport(type: 'log' | 'my'): Promise<any> {
            try {
                if (type === 'log') {
                    const dateFrom = parseDate('forJira')().split('-').map((el, i) => i === 2 ? '01' : el).join('-')
                    return fetch(`${hostname}/${reportApiPath}/?username=${authOptions.user}&dateFrom=${dateFrom}`, { method: 'GET', headers })
                } else {
                    const fetchOptions = {
                        method: 'POST',
                        headers,
                        body: `{
                            "jql": "project = \'Производство МИС / ЛИС\' AND assignee = ${authOptions.user} AND status in (Open, \'Under Review\', \'In dev\', \'To dev\', \'To Migration\', Migration) OR issuekey = MEDDEV-5351 ORDER BY status",
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
function getIssueInfo(path: string, headers: HeadersInit, task: string): Promise<any> {
    return fetch(`${path}/issue/${task}`, { method: 'GET', headers })
}

// получение ключа пользователя
function getUserInfo(path: string, headers: HeadersInit, user: string): Promise<any> {
    return fetch(`${path}/user/?username=${user}`, { method: 'GET', headers })
}