import {access, readFile} from 'node:fs/promises';
import {dirname, isAbsolute, relative, resolve, sep} from 'node:path';

const exists = async (candidate: string): Promise<boolean> => {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
};

export const isPathInside = (root: string, candidate: string): boolean => {
  const pathFromRoot = relative(root, candidate);
  return (
    pathFromRoot === '' ||
    (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot))
  );
};

export const resolveInside = (
  baseDirectory: string,
  relativePath: string,
  allowedRoot: string,
  label: string,
): string => {
  if (isAbsolute(relativePath)) {
    throw new Error(`${label} must be relative: ${relativePath}`);
  }

  const resolved = resolve(baseDirectory, relativePath);
  if (!isPathInside(allowedRoot, resolved)) {
    throw new Error(`${label} escapes its allowed root: ${relativePath}`);
  }

  return resolved;
};

export const findWorkspaceRoot = async (startingDirectory: string): Promise<string> => {
  let current = resolve(startingDirectory);

  while (true) {
    const packageJson = resolve(current, 'package.json');
    if (await exists(packageJson)) {
      const parsed = JSON.parse(await readFile(packageJson, 'utf8')) as {packageManager?: unknown};
      if (typeof parsed.packageManager === 'string' && parsed.packageManager.startsWith('pnpm@')) {
        return current;
      }
    }

    const parent = dirname(current);
    if (parent === current) {
      throw new Error('Could not find the pnpm workspace root.');
    }
    current = parent;
  }
};

export const resolveEpisodeDirectory = (workspaceRoot: string, episodeArgument: string): string =>
  resolveInside(workspaceRoot, episodeArgument, workspaceRoot, 'The --episode path');

export const pathExists = exists;
