import { STS, Credentials } from 'aws-sdk';

import { FUNCTION_NAME } from './constants';

const ASSUME_ROLE = 'assumeRole';

const defaults = { RoleSessionName: FUNCTION_NAME, ExternalId: FUNCTION_NAME };

export const client = async (op, params) => new STS()[op](params).promise();

export const assume = async (RoleArn) => {
  const data = await client(ASSUME_ROLE, { RoleArn, ...defaults });
  const { Credentials: { AccessKeyId, SecretAccessKey, SessionToken } } = data;
  return new Credentials(AccessKeyId, SecretAccessKey, SessionToken);
};
