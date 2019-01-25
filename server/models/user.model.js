const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    avatar: { type: String, required: true },
    displayName: { type: String, required: true },
    emails: [{ value: String, type: { type: String } }],
    idFromProvider: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
    surname: { type: String, required: true },
    tokens: [
      {
        access: {
          type: String
        },
        token: {
          type: String
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
