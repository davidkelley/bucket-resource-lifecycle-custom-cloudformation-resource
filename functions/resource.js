import response from 'cfn-response';

import { CREATE, UPDATE, DELETE } from './constants';

const wrap = ({ create, update, destroy }) => async (event, context) => {
  const map = { [CREATE]: create, [UPDATE]: update, [DELETE]: destroy };
  const respond = (verb, id, data = {}) => response.send(event, context, verb, data, id);
  const { PhysicalResourceId: resource, RequestType: type } = event;
  try {
    if (!Object.keys(map).includes(type)) {
      throw new Error(`Unknown operation "${type}".`);
    } else {
      const { id, data = {} } = await map[type](event);
      respond(response.SUCCESS, id, data);
    }
  } catch (err) {
    const { message: Reason } = err;
    respond(response.FAILED, resource, { Reason });
  }
};

export default wrap;
