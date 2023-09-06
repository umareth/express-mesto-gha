const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

// Список разрешенных источников
const allowedCors = [
  'http://shakh.eth.nomoredomainsicu.ru',
  'http://localhost:3000',
];

module.exports = (req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  const requestHeaders = req.headers['access-control-request-headers'];

  // Если источник запроса разрешен, устанавливаем заголовок Access-Control-Allow-Origin
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  // Если метод запроса - OPTIONS, устанавливаем заголовки CORS и завершаем ответ
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.header('Access-Control-Allow-Credentials', true);
    res.status(204).end(); // 204 No Content
  } else {
    next();
  }
};
