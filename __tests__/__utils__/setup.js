import faker from 'faker';

process.env.LOG_LEVEL = 'fatal';

process.env.AWS_REGION = 'eu-west-1';

process.env.AWS_LAMBDA_FUNCTION_NAME = faker.random.uuid();
