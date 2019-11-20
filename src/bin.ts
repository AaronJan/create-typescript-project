import chalk from 'chalk';
import { execute } from './create-typescript-project';

execute(process.argv).catch(err => {
  console.error(chalk.red(`Unexpected error, please submit an issue.`), err);
});
