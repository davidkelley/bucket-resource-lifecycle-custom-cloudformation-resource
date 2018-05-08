import { AWS_REGION } from '../constants';

import { paginate, destroy } from '../bucket';

const destroyContent = bucket => async (content) => {
  const keys = content.map(({ Key }) => ({ Key }));
  return destroy(bucket, keys);
};

export default async function (event) {
  const { ResourceProperties: { BucketName, Enabled } } = event;
  const enabled = (Enabled === 'true');
  if (enabled) {
    const contents = await paginate(BucketName);
    await Promise.all(contents.map(destroyContent(BucketName)));
  }
  return { id: `${AWS_REGION}:${BucketName}` };
}
