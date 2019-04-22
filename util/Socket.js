const createSocket = require('socket.io');

let io;

class Socket {
  constructor(server) {
    if (io) return io;

    io = createSocket(server);
    io.on('connection', (socket) => {
      // eslint-disable-next-line no-console
      console.log('client connected :', socket.id);

      socket.on('disconnect', (reason) => {
        // eslint-disable-next-line no-console
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

}

module.exports = Socket;
