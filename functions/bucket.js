import { S3 } from 'aws-sdk';

import { AWS_REGION } from './constants';

const LIST_OBJECTS = 'listObjectsV2';

const LIST_OBJECT_VERSIONS = 'listObjectVersions';

const DELETE_OBJECTS = 'deleteObjects';

const client = async (op, params, defaults = {}) => (
  new S3({ region: AWS_REGION, ...defaults })[op](params).promise()
);

const objectIterator = async (op, params, defaults) => {
  const {
    Contents: contents = [],
    NextContinuationToken: ContinuationToken = null,
  } = await client(op, params, defaults);
  if (ContinuationToken) {
    const continuation = { ...params, ContinuationToken };
    const next = await objectIterator(op, continuation, defaults);
    return [contents].concat(next);
  }
  return [contents];
};

const versionIterator = async (op, params, defaults) => {
  const {
    IsTruncated,
    Versions: versions = [],
    NextKeyMarker: KeyMarker = null,
    NextVersionIdMarker: VersionIdMarker = null,
  } = await client(op, params, defaults);
  if (IsTruncated) {
    const continuation = { ...params, KeyMarker, VersionIdMarker };
    const next = await versionIterator(op, continuation, defaults);
    return [versions].concat(next);
  }
  return [versions];
};

export const listObjects = (defaults = {}) => (
  async Bucket => objectIterator(LIST_OBJECTS, { Bucket }, defaults)
);

export const listVersions = (defaults = {}) => (
  async Bucket => versionIterator(LIST_OBJECT_VERSIONS, { Bucket }, defaults)
);

export const deleteObjects = (defaults = {}) => (
  async (Bucket, Objects) => client(DELETE_OBJECTS, {
    Bucket, Delete: { Objects },
  }, defaults)
);
