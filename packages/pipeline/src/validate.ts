import {stat} from 'node:fs/promises';
import {getCompositionDefinition} from '@studio/motion-system';
import {
  type ContentManifest,
  type ValidationIssue,
  validateContentManifest,
  validateCrossFile,
  validateEditManifest,
} from '@studio/manifest';
import type {EpisodeContext} from './episode';
import {pathExists, resolveInside} from './paths';

export type EpisodeValidation = {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
};

const toIssue = (path: string, message: string, code: string): ValidationIssue => ({path, message, code});

const validateRegisteredComponents = (content: ContentManifest): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  for (const [index, item] of content.items.entries()) {
    const definition = getCompositionDefinition(item.compositionId);
    if (definition === undefined) {
      issues.push(
        toIssue(
          `/items/${index}/compositionId`,
          `Composition "${item.compositionId}" is not registered in @studio/motion-system.`,
          'unknown-composition',
        ),
      );
      continue;
    }

    if (item.durationFrames > definition.defaultDurationInFrames * 20) {
      issues.push(
        toIssue(
          `/items/${index}/durationFrames`,
          `Duration ${item.durationFrames} exceeds the supported safety limit for "${item.compositionId}".`,
          'duration-too-large',
        ),
      );
    }

    const parsed = definition.schema.safeParse(item.props);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const propPath = issue.path.length === 0 ? '' : `/${issue.path.join('/')}`;
        issues.push(
          toIssue(
            `/items/${index}/props${propPath}`,
            issue.message,
            'invalid-component-props',
          ),
        );
      }
    }

    const logoAssetId = item.props.logoAssetId;
    if (typeof logoAssetId === 'string') {
      const asset = content.assets?.[logoAssetId];
      if (asset === undefined) {
        issues.push(
          toIssue(
            `/items/${index}/props/logoAssetId`,
            `logoAssetId "${logoAssetId}" does not resolve to a declared asset.`,
            'missing-logo-asset',
          ),
        );
      } else if (asset.kind !== 'image') {
        issues.push(
          toIssue(
            `/items/${index}/props/logoAssetId`,
            `logoAssetId "${logoAssetId}" must reference an image asset.`,
            'invalid-logo-asset-kind',
          ),
        );
      } else if (!(item.dependencies ?? []).includes(logoAssetId)) {
        issues.push(
          toIssue(
            `/items/${index}/dependencies`,
            `logoAssetId "${logoAssetId}" must also be declared in dependencies for content hashing.`,
            'undeclared-logo-dependency',
          ),
        );
      }
    }
  }

  return issues;
};

const validateFilesystem = async (context: EpisodeContext): Promise<ValidationIssue[]> => {
  const issues: ValidationIssue[] = [];
  const {content, episodeDirectory, workspaceRoot} = context;

  for (const [assetId, asset] of Object.entries(content.assets ?? {})) {
    try {
      const filePath = resolveInside(episodeDirectory, asset.path, workspaceRoot, `Asset "${assetId}"`);
      if (!(await pathExists(filePath))) {
        issues.push(toIssue(`/assets/${assetId}/path`, `Asset file does not exist: ${asset.path}`, 'missing-asset'));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(toIssue(`/assets/${assetId}/path`, message, 'unsafe-asset-path'));
    }
  }

  for (const [index, item] of content.items.entries()) {
    try {
      const outputPath = resolveInside(
        episodeDirectory,
        item.render.outputFile,
        episodeDirectory,
        `Render output for "${item.id}"`,
      );
      const destination = await stat(outputPath).catch(() => undefined);
      if (destination?.isDirectory() === true) {
        issues.push(
          toIssue(
            `/items/${index}/render/outputFile`,
            'Render output resolves to a directory.',
            'invalid-output-file',
          ),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(toIssue(`/items/${index}/render/outputFile`, message, 'unsafe-output-path'));
    }
  }

  return issues;
};

export const validateEpisode = async (context: EpisodeContext): Promise<EpisodeValidation> => {
  const contentResult = validateContentManifest(context.content);
  const editResult = validateEditManifest(context.edit);
  const issues: ValidationIssue[] = [...contentResult.issues, ...editResult.issues];

  if (contentResult.valid && editResult.valid && contentResult.value !== undefined && editResult.value !== undefined) {
    issues.push(...validateCrossFile(contentResult.value, editResult.value).issues);
    issues.push(...validateRegisteredComponents(contentResult.value));
    issues.push(...(await validateFilesystem({...context, content: contentResult.value, edit: editResult.value})));
  }

  return {valid: issues.length === 0, issues};
};
