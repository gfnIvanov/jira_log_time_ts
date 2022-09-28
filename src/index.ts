#!/usr/bin/env node

import { program } from 'commander'
import process from 'process'
import * as actions from './actions/Actions.js'

program
    .version('1.0.0')
    .description('Логируй время, работай с задачами и собирай отчеты не заходя в Jira!')

program
    .command('log')
    .option('-m', 'Manual log')
    .action(actions.logTime)

program
    .command('rep')
    .option('-m', 'My tasks')
    .action(actions.getReport)

program.parse(process.argv)
