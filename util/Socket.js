const createSocket = require('socket.io');

let io;

class Socket {
  constructor(server) {
    if (io) return io;

    io = createSocket(server);
    io.on('connection', (socket) => {
      // eslint-disable-next-line no-console
      console.log('client connected :', socket.id);
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
}

module.exports = Socket;
