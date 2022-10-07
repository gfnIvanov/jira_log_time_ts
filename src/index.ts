#!/usr/bin/env node

import { program } from 'commander'
import process from 'process'
import * as actions from './actions/Actions.js'

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
    .action(actions.getReport)

program
    .command('git')
    .action(actions.overGit)

program.parse(process.argv)
