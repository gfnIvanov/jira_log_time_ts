import inquirer, { Answers } from 'inquirer'
import * as c from './Router.consts.js'
import _ from 'lodash'

// список вопросов для автологирования
export function autoLogTime(): Promise<Answers> {
    return inquirer.prompt(_.concat(c.autoLogQuestions, c.logQuestions))
}

// список вопросов для ручного логирования
export function manualLogTime(): Promise<Answers> {
    return inquirer.prompt(_.concat(...c.manualLogQuestions, c.logQuestions))
}

// список вопросов для обновления данных таска
export function updateTask(chunk: boolean): Promise<Answers> {
    return inquirer.prompt(chunk ? _.pullAt(c.updateTaskLogQuestions, [1, 2, 3]) : c.updateTaskLogQuestions)
}

// список вопросов для взаимодействия с Git
export function overGit(command: 'add' | 'addFile' | 'comment' ): Promise<Answers> {
    switch (command) {
        case 'add': return inquirer.prompt(c.gitQuestions.add)
        case 'addFile': return inquirer.prompt(c.gitQuestions.addFile)
        case 'comment': return inquirer.prompt(c.gitQuestions.comment)
    }
}
