/* eslint-disable no-console */
const createSocket = require('socket.io');
const TokenManager = require('./token');

const tokenManager = new TokenManager();

const mapUserToSocket = (user, socket) => {
  socket.join(user._id, (err) => {
    if (err) console.error(err);

    console.log(
      `${user.profileName}(@${user._id}) logged-in by socket [${socket.id}]`
    );
  });
};

const clearSocket = (socket) => {
  const loggedInUsersOnThisSocket = Object.keys(socket.rooms)
    .filter(roomId => roomId !== socket.id);
    // socket은 default room은 자신의 id임

  loggedInUsersOnThisSocket.forEach(roomId => socket.leave(roomId));
  // default room 제외하고 모두 비움

  console.log(`@${loggedInUsersOnThisSocket.join(',')} logged-out from socket [${socket.id}]`);
};

let io;

class Socket {
  constructor(server) {
    if (io) return io;

    io = createSocket(server);
    io.on('connection', (socket) => {
      console.log('client connected :', socket.id);

      socket.on('LOGIN', (token) => {
        tokenManager.decodeToken(token)
          .then(user => mapUserToSocket(user, socket))
          .catch(err => console.error(err));
      });

      socket.on('LOGOUT', () => {
        clearSocket(socket);
      });

      socket.on('disconnect', (reason) => {
        console.log(`client ${socket.id} disconnected because '${reason}'`);
      });
    });

    return io;
  }

  static emitNewCategory(id) {
    io.emit('NEW_CATEGORY', id);
  }

  static emitDeleteCategory(id) {
    io.emit('DELETE_CATEGORY', id);
  }

  static emitNewPost(postId, categoryId) {
    const data = { postId, categoryId };
    io.emit('NEW_POST', data);
  }

  static emitDeletePost(postId, categoryId) {
    const data = { postId, categoryId };
    io.emit('DELETE_POST', data);
  }

  static emitUpdatePost(postId, categoryId) {
    const data = { postId, categoryId };
    io.emit('UPDATE_POST', data);
  }

  static emitNewComment(commentId, parentId, postId) {
    const data = { commentId, parentId, postId };
    io.emit('NEW_COMMENT', data);
  }

  static emitDeleteComment(commentId, postId) {
    const data = { commentId, postId };
    io.emit('DELETE_COMMENT', data);
  }

  static emitUpdateComment(commentId, postId) {
    const data = { commentId, postId };
    io.emit('UPDATE_COMMENT', data);
  }

  static emitPostHeart(commentId, authorId) {
    const data = { commentId, authorId };
    io.emit('POST_HEART', data);
  }

  static emitDeleteHeart(commentId) {
    const data = { commentId };
    io.emit('DELETE_HEART', data);
  }

  static emitPostCommentLikes(userId, commentId) {
    const data = { userId, commentId };
    io.emit('POST_COMMENT_LIKES', data);
  }

  static emitDeleteCommentLikes(userId, commentId) {
    const data = { userId, commentId };
    io.emit('DELETE_COMMENT_LIKES', data);
  }

  static emitPostCommentDislikes(userId, commentId) {
    const data = { userId, commentId };
    io.emit('POST_COMMENT_DISLIKES', data);
  }

  static emitDeleteCommentDislikes(userId, commentId) {
    const data = { userId, commentId };
    io.emit('DELETE_COMMENT_DISLIKES', data);
  }

  static emitUpdatedNotificationCheckTime(userId, time) {
    io.to(userId).emit('NOTIFICATION_CHECKED', time);
  }
}

module.exports = Socket;
