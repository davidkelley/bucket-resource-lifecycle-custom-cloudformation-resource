import { AWS_REGION } from '../constants';

export default async function (event) {
  const { ResourceProperties: { BucketName } } = event;
  return { id: `${AWS_REGION}:${BucketName}` };
}
