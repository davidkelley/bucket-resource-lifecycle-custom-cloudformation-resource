import faker from 'faker';
import response from 'cfn-response';

import resource from '@src/resource';

describe('#resource', () => {
  let create;

  let update;

  let destroy;

  let id;

  let data;

  beforeEach(() => {
    id = faker.random.uuid();
    data = { [faker.random.uuid()]: faker.random.number() };
    create = jest.fn(async () => ({ data, id }));
    update = jest.fn(async () => ({ data, id }));
    destroy = jest.fn(async () => ({ data, id }));
  });

  describe('Create event', () => {
    const event = {
      RequestType: 'Create',
    };

    const context = {
      [faker.random.uuid()]: faker.random.number(),
    };

    it('works', async () => {
      await resource({ create, update, destroy })(event, context);
      expect(create).toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(destroy).not.toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(event, context, response.SUCCESS, data, id);
    });
  });

  describe('Update event', () => {
    const event = {
      RequestType: 'Update',
    };

    const context = {
      [faker.random.uuid()]: faker.random.number(),
    };

    it('works', async () => {
      await resource({ create, update, destroy })(event, context);
      expect(create).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalled();
      expect(destroy).not.toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(event, context, response.SUCCESS, data, id);
    });
  });

  describe('Delete event', () => {
    const event = {
      RequestType: 'Delete',
    };

    const context = {
      [faker.random.uuid()]: faker.random.number(),
    };

    it('works', async () => {
      await resource({ create, update, destroy })(event, context);
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(destroy).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(event, context, response.SUCCESS, data, id);
    });
  });
});
