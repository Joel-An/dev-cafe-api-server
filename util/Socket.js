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
}

module.exports = Socket;
