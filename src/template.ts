import { promises as fsPromises } from 'fs';
import * as path from 'path';
import ejs from 'ejs';

import { copyResources, fsExists, readJSON } from './helpers';

export interface DependencyManifest {
  root: {
    dependencies: string[];
    devDependencies: string[];
  };
  packages: {
    dependencies: string[];
    devDependencies: string[];
  };
}

const AssetDirName = 'assets';
const AssetExtension = '.ejs';
const DependencyManifestFileName = 'dependencies.js';

/**
 * Where all templates are stored.
 */
const TemplatesRoot = path.resolve(path.join(__dirname, '..', 'templates'));

export function transformAsset(renderData: any, content: string): string {
  return ejs.render(content, renderData);
}

export async function populateAssets(
  renderData: any,
  templateName: string,
  destDirPath: string,
): Promise<void> {
  const templateAssetsDirPath = path.join(
    TemplatesRoot,
    templateName,
    AssetDirName,
  );
  const templateExisted = await fsExists(templateAssetsDirPath);
  if (templateExisted === false) {
    throw new Error(
      `Assets folder of template "${templateName}" doesn't exist.`,
    );
  }

  const transform = (filePath: string, content: string) => {
    const fileName = path.basename(filePath, AssetExtension);

    return {
      fileName,
      content: transformAsset(renderData, content),
    };
  };

  await copyResources(transform, templateAssetsDirPath, destDirPath);
}

export async function getDependencyManifest(
  templateName: string,
  options: any = {},
): Promise<DependencyManifest> {
  const manifestPath = path.join(
    TemplatesRoot,
    templateName,
    DependencyManifestFileName,
  );
  const manifestExisted = await fsExists(manifestPath);
  if (manifestExisted === false) {
    throw new Error(
      `Dependency manifest of template "${templateName}" doesn't exist.`,
    );
  }

  const getDependencies = require(manifestPath);

  return getDependencies(options);
}
