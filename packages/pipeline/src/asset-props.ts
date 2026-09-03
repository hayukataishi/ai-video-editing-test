import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';
import type {ContentItem} from '@studio/manifest';
import type {EpisodeContext} from './episode';
import {resolveInside} from './paths';

const imageMimeType = (filePath: string): string => {
  switch (extname(filePath).toLowerCase()) {
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
};

const toDataUrl = async (filePath: string): Promise<string> => {
  const encoded = (await readFile(filePath)).toString('base64');
  return `data:${imageMimeType(filePath)};base64,${encoded}`;
};

/**
 * Resolves the Phase 1 logical image contract. Components remain portable while
 * their episode-specific logo is embedded as a render-time data URL.
 */
export const materializeRenderProps = async (
  context: EpisodeContext,
  item: ContentItem,
): Promise<Record<string, unknown>> => {
  const props = {...item.props};
  const logoAssetId = props.logoAssetId;

  if (typeof logoAssetId !== 'string') {
    return props;
  }

  const asset = context.content.assets?.[logoAssetId];
  if (asset === undefined || asset.kind !== 'image') {
    throw new Error(`logoAssetId "${logoAssetId}" must reference an image asset.`);
  }

  const imagePath = resolveInside(
    context.episodeDirectory,
    asset.path,
    context.workspaceRoot,
    `Logo asset "${logoAssetId}"`,
  );
  props.logoSrc = await toDataUrl(imagePath);
  return props;
};
