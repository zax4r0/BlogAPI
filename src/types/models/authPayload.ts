import { objectType } from 'nexus'

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.field('user', { type: 'User' },)
    t.string('access_token');
    t.string('refresh_token');
  },
})

export const RegisterPayload = objectType({
  name:'Registerpayload',
  definition(t){
    // t.field('user',{type:'User'})
    t.string('firstName');;
    t.string('lastName');
    t.string('username');
    t.string('email');
    t.string('password');
  }
})