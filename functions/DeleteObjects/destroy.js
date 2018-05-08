import { AWS_REGION } from '../constants';

import { paginate, destroy } from '../bucket';
import { assume } from '../credentials';

const destroyContent = (bucket, credentials) => async (content) => {
  const keys = content.map(({ Key }) => ({ Key }));
  return destroy({ credentials })(bucket, keys);
};

export default async function (event) {
  const { ResourceProperties: { BucketName, RoleArn, Enabled } } = event;
  const enabled = (Enabled === 'true');
  if (enabled) {
    const credentials = await assume(RoleArn);
    const contents = await paginate({ credentials })(BucketName);
    await Promise.all(contents.map(destroyContent(BucketName, credentials)));
  }
  return { id: `${AWS_REGION}:${BucketName}` };
}
