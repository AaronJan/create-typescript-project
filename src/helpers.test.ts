import mockFS from 'mock-fs';
import * as os from 'os';
import * as path from 'path';
import { constants as fsConstants, promises as fsPromises } from 'fs';

import * as helpers from './helpers';

export async function createTempDirectory(
  namePrefix = 'aj-ctp-',
): Promise<string> {
  const prefix = path.join(os.tmpdir(), namePrefix);

  return await fsPromises.mkdtemp(prefix);
}

describe('ensureDirectory', () => {
  let rootDir: string;

  beforeEach(async () => {
    rootDir = await createTempDirectory();
  });

  afterEach(async () => {
    // Cleanup.
    await fsPromises.rmdir(rootDir, { recursive: true });
  });

  it('should create directories when they do not exist', async () => {
    const dir = path.join(rootDir, 'a', 'b', 'c');
    await helpers.ensureDirectory(dir);

    const stats = await fsPromises.stat(dir);
    expect(stats.isDirectory()).toBeTruthy();
  });

  it('should create directories when some of them do exist', async () => {
    const subDir = path.join(rootDir, 'sub');
    await fsPromises.mkdir(subDir);

    const dir = path.join(rootDir, 'sub', 'a', 'b', 'c');
    await helpers.ensureDirectory(dir);

    const stats = await fsPromises.stat(dir);
    expect(stats.isDirectory()).toBeTruthy();
  });

  it('should not throw when the directory already exists', async () => {
    const dir = path.join(rootDir, 'a', 'b', 'c');
    await fsPromises.mkdir(dir, { recursive: true });

    await helpers.ensureDirectory(dir);

    const stats = await fsPromises.stat(dir);
    expect(stats.isDirectory()).toBeTruthy();
  });
});

describe('copyResources', () => {
  const fixtureRootPath = path.join(
    __dirname,
    '__tests__',
    'fixtures',
    'transform',
  );
  let rootDir: string;

  beforeEach(async () => {
    rootDir = await createTempDirectory();
  });

  afterEach(async () => {
    // Cleanup.
    await fsPromises.rmdir(rootDir, { recursive: true });
  });

  it('should create files', async () => {
    const fixtureDirPath = path.join(fixtureRootPath, 'only-files');
    const transform = jest.fn().mockImplementation((relativePath, content) => {
      return {
        fileName: path.basename(relativePath),
        content,
      };
    });

    await helpers.copyResources(transform, fixtureDirPath, rootDir);

    expect(transform).toBeCalledTimes(2);
    expect(transform.mock.calls).toContainEqual([
      'text-1.txt',
      'hello world 1!',
    ]);
    expect(transform.mock.calls).toContainEqual([
      'text-2.txt',
      'hello world 2!',
    ]);
  });
});

// describe('spawnProcess', async () => {
//
// });
