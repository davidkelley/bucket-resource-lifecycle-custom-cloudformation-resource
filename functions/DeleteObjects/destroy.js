import { AWS_REGION } from '../constants';

import { listVersions, listObjects, deleteObjects } from '../bucket';
import { assume } from '../credentials';

const removeObjects = (bucket, credentials) => async (content) => {
  const keys = content.map(({ Key }) => ({ Key, VersionId: 'null' }));
  if (keys.length > 0) {
    return deleteObjects({ credentials })(bucket, keys);
  }
  return true;
};

const removeVersions = (bucket, credentials) => async (content) => {
  const keys = content.map(({ Key, VersionId }) => ({ Key, VersionId }));
  if (keys.length > 0) {
    return deleteObjects({ credentials })(bucket, keys);
  }
  return true;
};

export default async function (event) {
  const { ResourceProperties: { BucketName, RoleArn, Enabled } } = event;
  const enabled = (Enabled === 'true');
  if (enabled) {
    const credentials = await assume(RoleArn);
    const contents = await listObjects({ credentials })(BucketName);
    await Promise.all(contents.map(removeObjects(BucketName, credentials)));
    const versions = await listVersions({ credentials })(BucketName);
    await Promise.all(versions.map(removeVersions(BucketName, credentials)));
  }
  return { id: `${AWS_REGION}:${BucketName}` };
}
