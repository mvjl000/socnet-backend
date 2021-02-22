require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user-routes');

const app = express();

app.use(bodyParser.json());

app.use((error, req, res, next) => {
  res.status(error.code || 500);
  res.json({
    message: error.message || 'Unexpected server-side error occured.',
  });
});

app.use('/api/user', userRoutes);

mongoose
  .connect(
    `mongodb+srv://mvjl000:${process.env.DB_PASSWORD}@socnet-db.2iozq.mongodb.net/socnetdb?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
