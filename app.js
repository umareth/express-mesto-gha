const express = require('express');

const mongoose = require('mongoose'); // Подключаем mongoose

const bodyParser = require('body-parser');
const { errors, Joi, celebrate } = require('celebrate');

const NotFoundErr = require('./middlewares/err/notFound.js');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;
const { login, createUser } = require('./controllers/user');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/),
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(require('./middlewares/auth'));

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use(errors());

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    res.status(500).send({ message: 'Произошла ошибка на сервере' });
  }
  next();
});

app.use(() => {
  throw new NotFoundErr('Страница по указанному маршруту не найдена');
});

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
