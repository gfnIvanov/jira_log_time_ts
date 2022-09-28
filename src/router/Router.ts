import inquirer, { Answers } from 'inquirer'
import { logQuestions, autoLogQuestions, manualLogQuestions, updateTaskLogQuestions } from './Router.consts.js'
import _ from 'lodash'

// список вопросов для автологирования
export function autoLogTime(): Promise<Answers> {
    return inquirer.prompt(_.concat(autoLogQuestions, logQuestions))
}

// список вопросов для ручного логирования
export function manualLogTime(): Promise<Answers> {
    return inquirer.prompt(_.concat(...manualLogQuestions, logQuestions))
}

// список вопросов для обновления данных таска
export function updateTask(chank: boolean): Promise<Answers> {
    return inquirer.prompt(chank ? _.pullAt(updateTaskLogQuestions, [1, 2, 3]) : updateTaskLogQuestions)
}
