import faker from 'faker';
import AWS from 'aws-sdk-mock';

import destroy from '@src/DeleteObjects/destroy';

const MAX_PER_PAGE = 1000;

describe('DeleteObjects#destroy', () => {
  describe('when the request is successful', () => {
    const BucketName = faker.random.uuid();

    const RoleArn = faker.random.uuid();

    const event = {
      ResourceProperties: {
        BucketName,
        RoleArn,
        Enabled: faker.random.arrayElement(['true', 'false']),
      },
    };

    const generator = () => ({ Key: faker.random.uuid() });

    describe('when Enabled is false', () => {
      beforeEach(() => { event.ResourceProperties.Enabled = 'false'; });

      const mockedListObjectsV2 = jest.fn((params, cb) => cb(null, params));

      const mockedDeleteObjects = jest.fn((params, cb) => cb(null, params));

      beforeEach(() => {
        AWS.mock('S3', 'listObjectsV2', mockedListObjectsV2);
        AWS.mock('S3', 'deleteObjects', mockedDeleteObjects);
      });

      afterEach(() => {
        AWS.restore('S3');
      });

      it('responds correctly', async () => {
        const response = await destroy(event);
        expect(response).toEqual(expect.objectContaining({
          id: `${process.env.AWS_REGION}:${BucketName}`,
        }));
        expect(mockedListObjectsV2).not.toHaveBeenCalled();
        expect(mockedDeleteObjects).not.toHaveBeenCalled();
      });
    });

    describe('when Enabled is true', () => {
      beforeEach(() => { event.ResourceProperties.Enabled = 'true'; });

      const credentials = () => ({
        AccessKeyId: faker.random.uuid(),
        SecretAccessKey: faker.random.uuid(),
        SessionToken: faker.random.uuid(),
      });

      const mockedSTSAssumeRole = jest.fn((params, cb) => cb(null, {
        Credentials: credentials(),
      }));

      beforeEach(() => {
        AWS.mock('STS', 'assumeRole', mockedSTSAssumeRole);
      });

      afterEach(() => {
        AWS.restore('STS');
      });

      afterEach(() => {
        expect(mockedSTSAssumeRole).toHaveBeenCalledTimes(1);
        expect(mockedSTSAssumeRole).toHaveBeenCalledWith(expect.objectContaining({
          RoleSessionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
          ExternalId: process.env.AWS_LAMBDA_FUNCTION_NAME,
          RoleArn,
        }), expect.any(Function));
        mockedSTSAssumeRole.mockClear();
      });

      describe('when there are <1000 objects', () => {
        const numOfObjects = faker.random.number({ min: 1, max: 999 });

        const contents = Array(numOfObjects).fill(1).map(generator);

        const mockedListObjectsV2 = jest.fn((params, cb) => (
          cb(null, { Contents: contents })
        ));

        const mockedDeleteObjects = jest.fn((params, cb) => cb(null, {}));

        beforeEach(() => {
          AWS.mock('S3', 'listObjectsV2', mockedListObjectsV2);
          AWS.mock('S3', 'deleteObjects', mockedDeleteObjects);
        });

        afterEach(() => {
          AWS.restore('S3');
        });

        it('responds correctly', async () => {
          const response = await destroy(event);
          expect(response).toEqual(expect.objectContaining({
            id: `${process.env.AWS_REGION}:${BucketName}`,
          }));
          expect(mockedListObjectsV2).toHaveBeenCalledTimes(1);
          expect(mockedDeleteObjects).toHaveBeenCalledTimes(1);
          expect(mockedDeleteObjects).toHaveBeenCalledWith(expect.objectContaining({
            Bucket: BucketName,
            Delete: expect.objectContaining({
              Objects: expect.arrayContaining([
                expect.objectContaining({
                  Key: expect.any(String),
                }),
              ]),
            }),
          }), expect.any(Function));
        });
      });

      describe('when there are >1000 objects', () => {
        const numOfPages = faker.random.number({ min: 2, max: 10 });

        const contents = Array(numOfPages).fill(1).map(() => (
          Array(MAX_PER_PAGE).fill(1).map(generator)
        ));

        const iterator = pages => (params, cb) => {
          const { ContinuationToken = 0 } = params;
          const continuation = parseInt(ContinuationToken, 10);
          const token = continuation + 1;
          const NextContinuationToken = token.toString();
          const Contents = pages[continuation];
          const next = token >= pages.length ? {} : { NextContinuationToken };
          cb(null, { Contents, ...next });
        };

        const mockedListObjectsV2 = jest.fn(iterator(contents));

        const mockedDeleteObjects = jest.fn((params, cb) => cb(null, {}));

        beforeEach(() => {
          AWS.mock('S3', 'listObjectsV2', mockedListObjectsV2);
          AWS.mock('S3', 'deleteObjects', mockedDeleteObjects);
        });

        afterEach(() => {
          AWS.restore('S3');
        });

        it('responds correctly', async () => {
          const response = await destroy(event);
          expect(response).toEqual(expect.objectContaining({
            id: `${process.env.AWS_REGION}:${BucketName}`,
          }));
          expect(mockedListObjectsV2).toHaveBeenCalledTimes(numOfPages);
          expect(mockedDeleteObjects).toHaveBeenCalledTimes(numOfPages);
          expect(mockedDeleteObjects).toHaveBeenCalledWith(expect.objectContaining({
            Bucket: BucketName,
            Delete: expect.objectContaining({
              Objects: expect.arrayContaining([
                expect.objectContaining({
                  Key: expect.any(String),
                }),
              ]),
            }),
          }), expect.any(Function));
        });
      });
    });
  });
});
