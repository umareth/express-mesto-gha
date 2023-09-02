const express = require('express');

const router = express.Router();
const { celebrate, Joi } = require('celebrate');

const cardController = require('../controllers/card');

// Роут для получения всех карточек
router.get('/', cardController.getCards);

// Роут для создания карточки
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/),
  }),
}), cardController.createCard);

// Роут для удаления карточки по идентификатору
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), cardController.deleteCard);

// Роут для добавления лайка карточке
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), cardController.likeCard);

// Роут для удаления лайка с карточки
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), cardController.dislikeCard);

module.exports = router;
