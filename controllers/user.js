const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Обработка GET-запроса для получения всех пользователей

const NotFoundErr = require('../middlewares/err/notFound.js');
const BadRequestErr = require('../middlewares/err/badReq');
const ConflictErr = require('../middlewares/err/confErr');

const { NODE_ENV, JWT_SECRET } = process.env;

exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestErr('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.getСurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(200).send(user))
    .catch(next);
};

// Обработка GET-запроса для получения пользователя по ID
exports.getUserById = (req, res, next) => {
  User.findById(req.params._id)
    .orFail(() => {
      throw new NotFoundErr('Пользователь по указанному _id не найден');
    })
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestErr('Передан невалидный id пользователя'));
      } else {
        next(error);
      }
    });
};

// Обработка POST-запроса для создания пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => {
      res.status(201).send({
        name,
        about,
        avatar,
        email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictErr('Пользователь с таким email уже существует в базе'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: false,
      });

      res.send({ token });
    })
    .catch(next);
};

// Обработка PUT-запроса для обновления информации о пользователе
module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFoundErr('Запрашиваемый пользователь не найден');
    })
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestErr('Переданы невалидные данные для обновления данных юзера'));
      } else {
        next(error);
      }
    });
};

// Обработка PUT-запроса для обновления аватара пользователя
module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFoundErr('Запрашиваемый пользователь не найден');
    })
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestErr('Отправлены невалидные данные для обновления аватара'));
      } else {
        next(error);
      }
    });
};
