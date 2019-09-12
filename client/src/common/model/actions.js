import socket from 'sockets';
import { CommonActionTypes } from 'common/model/actionTypes';

export const clearMetaDataSuccess = () => ({
  type: CommonActionTypes.LEAVE_VIEW
});

export const enterView = (route, userId) => dispatch =>
  socket.emit('enterView', { userId, view: route });

export const leaveView = (route, userId) => dispatch => {
  dispatch(clearMetaDataSuccess());
  socket.emit('leaveView', { userId, view: route });
};

export const joinRoom = (route, id, userId) => dispatch => {
  const data = { roomId: `${route}-${id}`, userId, viewId: id };

  socket.emit('joinRoom', { data, room: route });
};

export const leaveRoom = (route, id, userId) => dispatch => {
  const data = { roomId: `${route}-${id}`, userId, viewId: id };

  socket.emit('leaveRoom', { data, room: route });

  dispatch(clearMetaDataSuccess());
};
