import { promises as fsPromises, constants as fsConstants } from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

export async function fsExists(target: string): Promise<boolean> {
  try {
    await fsPromises.access(target, fsConstants.F_OK);

    return true;
  } catch (err) {
    return false;
  }
}

export async function readJSON<T extends object>(filePath: string): Promise<T> {
  const content = (await fsPromises.readFile(filePath)).toString('utf8');

  return JSON.parse(content);
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

export async function renameDirectory(
  oldPath: string,
  newPath: string,
): Promise<void> {
  await fsPromises.rename(oldPath, newPath);
}

export async function copyResources(
  transform: (
    filePath: string,
    content: string,
  ) => { fileName: string; content: string },
  sourceDir: string,
  destDir: string,
): Promise<void> {
  await ensureDirectory(destDir);
  let entities: string[] = await fsPromises.readdir(sourceDir);

  let entity: undefined | string;
  while ((entity = entities.shift()) !== undefined) {
    const sourceEntityPath = path.join(sourceDir, entity);
    const relativePath = path.relative(sourceDir, sourceEntityPath);
    const destPath = path.join(destDir, relativePath);
    const entityStats = await fsPromises.stat(sourceEntityPath);

    if (entityStats.isFile()) {
      const destDirPath = path.dirname(destPath);
      const content = await fsPromises.readFile(sourceEntityPath);
      const { fileName, content: transformedContent } = transform(
        relativePath,
        content.toString('utf8'),
      );
      await fsPromises.writeFile(
        path.join(destDirPath, fileName),
        transformedContent,
      );
    }
    if (entityStats.isDirectory()) {
      await ensureDirectory(destPath);
      const subEntities = await fsPromises.readdir(sourceEntityPath);

      entities = subEntities
        .map(subEntity => path.join(entity as string, subEntity))
        .concat(entities);
    }
  }
}

export function spawnProcess(
  cwd: string,
  command: string,
  args: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const childProc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
    });
    childProc.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }

      resolve();
    });
  });
}
