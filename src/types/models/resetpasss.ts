import { objectType } from 'nexus';


export const ResetpassPayload = objectType({
  name: 'ResetpassPayload',
  definition(t) {
    // t.field('user',{type:'User'})
    t.string('userId');
    t.string('token');
    t.string('password');
  },
});
