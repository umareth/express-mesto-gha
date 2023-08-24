// users.js (в папке routes)
const express = require('express');

const router = express.Router();
const usersController = require('../controllers/user'); // Импортируйте контроллер пользователей

// Маршрут для получения всех пользователей
router.get('/', usersController.getUsers);

// Маршрут для получения пользователя по ID
router.get('/:userId', usersController.getUserById);

// Маршрут для создания пользователя
router.post('/', usersController.createUser);

router.patch('/me', usersController.updateUserInfo);
router.patch('/me/avatar', usersController.updateUserAvatar);

module.exports = router;
