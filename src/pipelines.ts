import { spawnProcess } from './helpers';

/**
 * Install dependencies using NPM.
 */
export async function executeNPMInstall(dirPath: string, additionArgs: string[]): Promise<void> {
  const command = 'npm';
  const args = ['install', '--save', '--loglevel', 'error'].concat(additionArgs);

  await spawnProcess(dirPath, command, args);
}
