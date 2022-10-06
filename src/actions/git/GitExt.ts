import chalk from 'chalk'
import { exec } from 'child_process'
import { empty } from '../../utils/utils.js'

export default class GitExt {
    private files: string[]
    private branch!: string
    private comment: string | undefined

    constructor () {
        this.files = []
    }

    set newFile(file: string) {
        this.files.push(file)
    }

    set newBranch(value: string) {
        this.branch = value
    }

    set newComment(value: string) {
        this.comment = value
    }

    private execBashCommand(command: string, callback: () => void) {
        exec(command, async err => {
            try {
                if (!empty(err)) {
                    throw new Error(`Ошибка при выполнении команды "${command}": ${err}`)
                }
                callback.call(this)
            } catch(err) {
                console.error(chalk.red(err))
            }
        })
    }

    public gitAdd() {
        if (this.files.length === 0) {
            this.execBashCommand('git add .', this.gitCommit)
        } else {
            const callback = this.files.length === 1 ? this.gitCommit : this.gitAdd
            this.execBashCommand(`git add ${this.files.pop()}`, callback)
        }
    }

    private gitCommit() {
        this.execBashCommand(`git commit -m "${this.comment}"`, this.gitPush)
    }

    private gitPush() {
        this.execBashCommand(`git push origin ${this.branch}`, this.gitFinish)
    }

    private gitFinish() {
        console.log(chalk.green('Изменения успешно переданы в репозиторий!'))
    }
}