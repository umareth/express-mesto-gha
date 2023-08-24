const Card = require('../models/card');

// Обработка GET-запроса для получения всех карточек
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((error) => res.status(500).send({ message: error.message }));
};

// Обработка POST-запроса для создания карточки
exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(400).send({
          message: `Переданы некорректные данные для создании карточки - ${error.message}`,
        });
      }
      return res.status(500).send({ message: error.message });
    });
};

// Обработка DELETE-запроса для удаления карточки по идентификатору
exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .orFail()
    .then(() => res.status(200).send({ message: 'Карточка удалена' }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для удаления карточки.' });
      }
      if (error.name === 'DocumentNotFoundError') {
        return res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(500).send({ message: error.message });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      res.status(404);
      throw Error;
    })
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res
          .status(400)
          .send({ message: 'Переданы невалидные данные карточки' });
      } else if (error.name === 'CastError') {
        res.status(400).send({ message: 'Передан невалидный id карточки' });
      } else if (res.statusCode === 404) {
        res.send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(500).send({ message: `${error.message}` });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      res.status(404);
      throw Error;
    })
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res
          .status(400)
          .send({ message: 'Переданы невалидные данные карточки' });
      } else if (error.name === 'CastError') {
        res.status(400).send({ message: 'Передан невалидный id карточки' });
      } else if (res.statusCode === 404) {
        res.send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(500).send({ message: `${error.message}` });
      }
    });
};
