#!/usr/bin/env node

import { program } from 'commander'
import process from 'process'
import config from './config.js'
import * as actions from './actions/Actions.js'
import Datastore from 'nedb'
import path from 'path'

const db = new Datastore({ 
    filename: path.join(path.sep, config.projectPath, 'database', 'gitPushHistory'), 
    autoload: true 
})
db.ensureIndex({ fieldName: 'task' })
db.ensureIndex({ fieldName: 'date' })

program
    .version('1.0.0')
    .description('Логируй время, работай с задачами и собирай отчеты не заходя в Jira!')

program
    .command('log')
    .option('-p', 'Enter part')
    .option('-f', 'Enter full')
    .action(actions.logTime)

program
    .command('upd')
    .action(actions.updateTask)

program
    .command('rep')
    .option('-m', 'My tasks')
    .option('-w', 'My work')
    .action(actions.getReport)

program
    .command('git')
    .action(actions.overGit)

program.parse(process.argv)

export default db
