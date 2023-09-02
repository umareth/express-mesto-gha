const Card = require('../models/card');

const NotFoundErr = require('../middlewares/err/notFound.js');
const BadRequestErr = require('../middlewares/err/badReq');
const ForbiddenErr = require('../middlewares/err/errForbidden');

// Обработка GET-запроса для получения всех карточек
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

// Обработка POST-запроса для создания карточки
exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => next(err));
};

// Обработка DELETE-запроса для удаления карточки по идентификатору
exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .orFail(() => {
      throw new NotFoundErr('Карточка с указанным _id не найдена');
    })
    .then((card) => {
      if (req.user._id !== card.owner._id.toString()) {
        throw new ForbiddenErr('Можно удалять только свои карточки');
      } else {
        return card.remove();
      }
    })
    .then(() => res.status(200).send({ message: 'Карточка удалена' }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestErr('Переданы некорректные данные для удаления карточки.'));
      } else {
        next(error);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundErr('Запрашиваемая карточка не найдена');
    })
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestErr('Передан невалидный id'));
      } else {
        next(error);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundErr('Запрашиваемая карточка не найдена');
    })
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestErr('Передан невалидный id'));
      } else {
        next(error);
      }
    });
};
