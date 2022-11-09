const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// PORT
const port = 3000;

// create redis client
let client = redis.createClient();

client.on('connect', function () {
  console.log('Redis Connected');
});

// init app
const app = express();

// view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// method override
app.use(methodOverride('_method'));

// search page
app.get('/', function (req, res, next) {
  res.render('searchusers');
});

// search processing
app.post('/user/search', function (req, res, next) {
  let id = req.body.id;
  client.HGETALL(id, function (err, obj) {
    if (!obj) {
      res.render('searchusers', {
        error: 'User does not exist',
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj,
      });
    }
  });
});

// add user page
app.get('/user/add', function (req, res, next) {
  res.render('adduser');
});

// process add user page
app.post('/user/add', function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.HMSET(
    id,
    [
      'first_name',
      first_name,
      'last_name',
      last_name,
      'email',
      email,
      'phone',
      phone,
    ],
    function (err, reply) {
      if (err) console.log(err);
      console.log(reply);
      res.redirect('/');
    }
  );
});

// delete user
app.delete('/user/delete/:id', function (req, res, next) {
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, function () {
  console.log('Server is running on ' + port);
});
