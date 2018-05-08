import faker from 'faker';

import create from '@src/DeleteObjects/create';

describe('DeleteObjects#create', () => {
  describe('when the request is successful', () => {
    const BucketName = faker.random.uuid();

    const Enabled = faker.random.arrayElement(['true', 'false']);

    const event = {
      ResourceProperties: {
        BucketName,
        Enabled,
      },
    };

    it('responds correctly', () => (
      expect(create(event)).resolves.toEqual(expect.objectContaining({
        id: `${process.env.AWS_REGION}:${BucketName}`,
      }))
    ));
  });
});
