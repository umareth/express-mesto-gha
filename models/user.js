const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const BadRequestError = require('../middlewares/err/badReq');
const UnauthorizedError = require('../middlewares/err/errAuth');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: function validateAvatarURL(value) {
          // Исправленное регулярное выражение для проверки ссылки на аватар
          const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*#?$/;
          return urlPattern.test(value);
        },
        message: 'Некорректная ссылка на аватар',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: 'Указан невалидный email',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new BadRequestError('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
