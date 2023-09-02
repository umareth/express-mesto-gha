// users.js (в папке routes)
const express = require('express');

const router = express.Router();
const { celebrate, Joi } = require('celebrate');

const usersController = require('../controllers/user'); // Импортируйте контроллер пользователей=

// Маршрут для получения всех пользователей
router.get('/', usersController.getUsers);

router.get('/me', usersController.getСurrentUser);

// Маршрут для получения пользователя по ID
router.get('/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24),
  }),
}), usersController.getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), usersController.updateUserInfo);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/^https?:\/\/(?:[a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,9}(?:\/[^/]+)*\/[^/]+\.(?:jpg|jpeg|png|gif|bmp|svg|webp)$/i),
  }),
}), usersController.updateUserAvatar);

module.exports = router;
