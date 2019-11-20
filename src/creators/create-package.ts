import commander from 'commander';
import * as path from 'path';
import chalk from 'chalk';

import { ensureDirectory, renameDirectory } from '../helpers';
import {
  validatePacakgeName,
  checkNpmVersion,
  isSafeToCreateProjectIn,
} from '../validation';
import { executeNPMInstall } from '../pipelines';
import { getDependencyManifest, populateAssets } from '../template';

export interface MonorepoSpecification {
  defaultPackage: {
    name: string;
    packageName: string;
  };
}

export interface Specification {
  /**
   * Package's name.
   */
  name: string;
  /**
   * Package's initial version.
   */
  version: string;
  /**
   * Package's description.
   */
  description?: string;
  /**
   * Monorepo configuration.
   */
  monorepo?: MonorepoSpecification;
}

interface MonorepoOptions {
  defaultPackage: {
    name: string;
    namespaced: boolean;
  };
}

interface CreatePackageOptions {
  verbose: boolean;
  monorepo?: MonorepoOptions;
}

export function assembleMonorepoSpecification(
  packageName: string,
  options: MonorepoOptions,
): MonorepoSpecification {
  let defaultPackageName: string;
  if (options.defaultPackage.namespaced === true) {
    defaultPackageName = `@${packageName}/${options.defaultPackage.name}`;
  } else {
    defaultPackageName = options.defaultPackage.name;
  }

  return {
    defaultPackage: {
      name: options.defaultPackage.name,
      packageName: defaultPackageName,
    },
  };
}

/**
 * Main command.
 */
export async function createPackage(
  name: string,
  options: CreatePackageOptions,
): Promise<void> {
  const packageRoot = path.resolve(name);
  const packageName = path.basename(packageRoot);

  validatePacakgeName(packageName);
  checkNpmVersion();

  const specification: Specification = {
    name: packageName,
    version: '0.1.0',
    monorepo:
      options.monorepo !== undefined
        ? assembleMonorepoSpecification(name, options.monorepo)
        : undefined,
  };

  let projectType: string;
  let templateName: string;
  if (specification.monorepo !== undefined) {
    projectType = 'Monorepo Package';
    templateName = 'package-monorepo';
  } else {
    projectType = 'Package';
    templateName = 'package';
  }

  console.log(`Creating a ${chalk.blue(projectType)} project...`);
  console.log(
    chalk.gray(
      `Creating project's directory: "${chalk.underline.white(packageRoot)}"`,
    ),
  );
  ensureDirectory(packageRoot);
  if (isSafeToCreateProjectIn(packageRoot, name) === false) {
    process.exit(1);
  }

  try {
    // Populate assets using built-in templates.
    console.log(chalk.gray('Populating assets...'));
    await populateAssets(specification, templateName, packageRoot);

    if (options.monorepo !== undefined) {
      // Rename default package directory.
      await renameDirectory(
        path.join(packageRoot, 'packages', '_default'),
        path.join(
          packageRoot,
          'packages',
          options.monorepo.defaultPackage.name,
        ),
      );
    }

    const dependencyManifest = await getDependencyManifest(templateName);
    const additionNPMArgs: string[] = [];
    if (options.verbose === true) {
      additionNPMArgs.push('--verbose');
    }
    // Install root dependencies
    if (dependencyManifest.root.dependencies.length > 0) {
      console.log(`Installing ${chalk.green('dependencies')}...`);
      await executeNPMInstall(
        packageRoot,
        additionNPMArgs.concat(dependencyManifest.root.dependencies),
      );
    }
    // Install root devDependencies
    if (dependencyManifest.root.devDependencies.length > 0) {
      console.log(`Installing ${chalk.yellow('devDependencies')}...`);
      await executeNPMInstall(
        packageRoot,
        additionNPMArgs.concat(dependencyManifest.root.devDependencies),
      );
    }

    console.log();
    console.log(chalk.green('Project created, have fun!'));
    console.log();
  } catch (err) {
    console.log();
    console.log('Aborting installation.');

    if (err.command) {
      console.log(`  ${chalk.cyan(err.command)} has failed.`);
    } else {
      console.log(chalk.red('Unexpected error. Please report it as a bug:'));
      console.log(err);
    }
    console.log();

    console.log(
      chalk.yellow(
        `You have to remove the generated files in "${chalk.cyan(
          packageRoot,
        )}" by yourself.`,
      ),
    );
  }
}
