import commander from 'commander';
import * as path from 'path';
import chalk from 'chalk';
const envinfo = require('envinfo');

import { createPackage } from './creators';

/**
 * `package.json` of this package.
 */
const packageJSON = require(path.join(__dirname, '..', 'package.json'));

export function showAdditionHelpMessages(): void {
  // TODO:
}

export function showEnvironmentInfo(): Promise<void> {
  console.log(chalk.bold('\nEnvironment Info:'));
  return envinfo
    .run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'npm', 'Yarn'],
      },
      {
        duplicates: true,
        showNotFound: true,
      },
    )
    .then(console.log);
}

/**
 * Main function that starts all.
 */
export async function execute(args: string[]): Promise<void> {
  const program = new commander.Command();
  program.version(packageJSON.version);

  program.command('env').action(cmd => showEnvironmentInfo());

  program
    .command('package <project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action((project, cmd) =>
      createPackage(project, {
        verbose: cmd.verbose,
      }),
    )
    .option('--verbose', 'print additional logs', false)
    .allowUnknownOption();

  program
    .command('mono-package <project-directory> <default-package>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action((project, defaultPackageName, cmd) =>
      createPackage(project, {
        verbose: cmd.verbose,
        monorepo: {
          defaultPackage: {
            name: defaultPackageName,
            namespaced: cmd.namespaced,
          },
        },
      }),
    )
    .option('-n, --namespaced', 'does the default package use namespace', false)
    .option('--verbose', 'print additional logs', false)
    .allowUnknownOption();

  program.on('--help', () => showAdditionHelpMessages());

  if (args.length <= 2) {
    program.help();
  } else {
    program.parse(args);
  }
}
