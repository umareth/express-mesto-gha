const User = require('../models/user'); // Обработка GET-запроса для получения всех пользователей

exports.getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      res
        .status(500)
        .send({ message: `Ошибка по умолчанию -  ${error.message}` });
    });
};

// Обработка GET-запроса для получения пользователя по ID
exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(400).send({ message: `Ошибка по умолчанию -  ${error.message}` });
      }
      if (error.name === 'DocumentNotFoundError') {
        return res
          .status(404)
          .send({ message: 'Пользователь по указанному id не найден.' });
      }
      return res.status(500).send({ message: error.message });
    });
};

// Обработка POST-запроса для создания пользователя
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(400).send({
          message: `Переданы некорректные данные при создании пользователя. ${error.message}`,
        });
      }
      return res.status(500).send({ message: error.message });
    });
};

// Обработка PUT-запроса для обновления информации о пользователе
module.exports.updateUserInfo = (req, res) => {
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
      res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
      throw Error;
    })
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({
          message: 'Переданы невалидные данные для обновления данных юзера',
        });
      } else if (error.name === 'CastError') {
        res.status(400).send({ message: 'Передан невалидный id юзера' });
      } else {
        res
          .status(500)
          .send({ message: `Ошибка по умолчанию -  ${error.message}` });
      }
    });
};

// Обработка PUT-запроса для обновления аватара пользователя
module.exports.updateUserAvatar = (req, res) => {
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
      res.status(404).send({ message: 'Запрашиваемый юзер не найден' });
      throw Error;
    })
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({
          message: 'Отправлены невалидные данные для обновления аватара',
        });
      } else if (error.name === 'CastError') {
        res.status(400).send({ message: 'Отправлен невалидный id юзера' });
      } else {
        res
          .status(500)
          .send({ message: `Ошибка по умолчанию -  ${error.message}` });
      }
    });
};
