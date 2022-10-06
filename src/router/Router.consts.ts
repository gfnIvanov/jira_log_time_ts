import { Question } from 'inquirer'
import { InqArr } from './Router.types.js'
import config from '../config.js'


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
        choices: config.projects
    },
    {
        type: 'input',
        name: 'task',
        message: 'Номер таска: '
    },
    {
        type: 'input',
        name: 'comment',
        message: 'Комментарий: '
    },
    {
        type: 'list',
        name: 'status',
        message: 'Статус:',
        choices: config.taskStatuses
    },
    {
        type: 'list',
        name: 'performer',
        message: 'Исполнитель:',
        choices: config.taskPerformers.map(user => user.name)
    },
]

export const gitQuestions: { [x: string]: InqArr } = {
    add: [{
        type: 'list',
        name: 'addAll',
        message: 'Добавить в индекс все изменения сразу?',
        choices: ['Да', 'Нет']
    }],
    addFile: [
        {
            type: 'input',
            name: 'file',
            message: 'Добавить файл: '
        },
        {
            type: 'list',
            name: 'repeate',
            message: 'Добавить еще один файл?',
            choices: ['Да', 'Нет']
        }
    ],
    comment: [{
        type: 'input',
        name: 'comment',
        message: 'Комментарий: '
    }]
}
