import { S3 } from 'aws-sdk';

import { AWS_REGION } from './constants';

const LIST_OBJECTS = 'listObjectsV2';

const DELETE_OBJECTS = 'deleteObjects';

const client = async (op, params) => new S3({ region: AWS_REGION })[op](params).promise();

const paginator = async (op, params) => {
  const {
    Contents = [],
    NextContinuationToken: ContinuationToken = null,
  } = await client(op, params);
  if (ContinuationToken) {
    const AdditionalContents = await paginator(op, { ...params, ContinuationToken });
    return [Contents].concat(AdditionalContents);
  }
  return [Contents];
};

export const paginate = async Bucket => paginator(LIST_OBJECTS, { Bucket });

export const destroy = async (Bucket, Objects) => client(DELETE_OBJECTS, {
  Bucket,
  Delete: {
    Objects,
  },
});
