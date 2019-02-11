import { AuthorizationActionTypes } from './actions';
import { data } from 'modules/authorization/model/reducer';

describe('Authorization reducer', () => {
  it('should store user data upon login', () => {
    expect(
      data(null, {
        type: AuthorizationActionTypes.SET_CURRENT_USER_SUCCESS,
        payload: {
          name: 'John Smith',
          avatarUrl: 'http://www.example.com',
          id: '12345'
        }
      })
    ).toEqual({
      name: 'John Smith',
      avatarUrl: 'http://www.example.com',
      id: '12345'
    });
  });

  it('should delete user data upon logout', () => {
    expect(
      data(
        {
          name: 'John Smith',
          avatarUrl: 'http://www.example.com',
          id: '12345'
        },
        {
          type: AuthorizationActionTypes.LOGOUT_USER_SUCCESS
        }
      )
    ).toEqual(null);
  });
});
