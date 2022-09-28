import { Question } from 'inquirer'
import { InqArr } from './Router.types.js'
import config from '../config.json' assert { type: 'json' }


export const logQuestions: InqArr = [
    {
        type: 'input',
        name: 'time',
        message: 'Затраченное время (ч): '
    },
    {
        type: 'list',
        name: 'action',
        message: 'Вид деятельности',
        choices: config.workKind
    },
    {
        type: 'input',
        name: 'comment',
        message: 'Комментарий: '
    },
    {
        type: 'list',
        name: 'upd_task',
        message: 'Обновить задачу после логирования?',
        choices: ['Нет', 'Да']
    }
]

export const autoLogQuestions: Question = {
    type: 'input',
    name: 'task',
    message: 'Номер таска MEDDEV: '
}

export const manualLogQuestions: InqArr = [
    {
        type: 'list',
        name: 'project',
        message: 'Проект',
        choices: config.projects
    },
    {
        type: 'input',
        name: 'task',
        message: 'Номер таска: '
    },
    {
        type: 'input',
        name: 'date',
        message: 'Дата в формате dd.mm.yyyy: '
    }
]

export const updateTaskLogQuestions: InqArr = [
    {
        type: 'list',
        name: 'project',
        message: 'Проект:',
        choices: config.projects,
    },
    {
        type: 'input',
        name: 'task',
        message: 'Номер таска: ',
    },
    {
        type: 'input',
        name: 'comment',
        message: 'Комментарий: ',
    },
    {
        type: 'list',
        name: 'status',
        message: 'Статус:',
        choices: config.taskStatuses,
    },
    {
        type: 'list',
        name: 'performer',
        message: 'Исполнитель:',
        choices: config.taskPerformers.map(user => user.name),
    },
]
