export const CREATE = 'Create';

export const UPDATE = 'Update';

export const DELETE = 'Delete';

export const { AWS_REGION } = process.env;

/**
 * Retrieves the name of the AWS Lambda function from the Lambda execution
 * environment variables.
 *
 * @type {String}
 */
export const FUNCTION_NAME = (process.env.AWS_LAMBDA_FUNCTION_NAME || 'default');
