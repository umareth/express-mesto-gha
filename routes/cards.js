const express = require('express');

const router = express.Router();
const cardController = require('../controllers/card');

// Роут для получения всех карточек
router.get('/', cardController.getCards);

// Роут для создания карточки
router.post('/', cardController.createCard);

// Роут для удаления карточки по идентификатору
router.delete('/:cardId', cardController.deleteCard);

router.put('/:cardId/likes', cardController.likeCard);
router.delete('/:cardId/likes', cardController.dislikeCard);

module.exports = router;
