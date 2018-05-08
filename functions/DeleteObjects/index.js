import resource from '../resource';
import create from './create';
import destroy from './destroy';

export const handler = resource({ create, destroy, update: create });
