const mongoose = require('mongoose');

const { Schema } = mongoose;

const boardSchema = new Schema({
  nameKor: { type: String, required: true },
  nameEng: { type: String, required: true },
  boardType: {
    type: String,
    enum: ['Normal', 'Best', 'Admin'],
    default: 'Normal',
  },
});

module.exports = mongoose.model('Board', boardSchema);
