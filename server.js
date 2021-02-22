const express = require('express');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user-routes');

const app = express();

app.use(bodyParser.json());

app.use('/api/user', userRoutes);

app.listen(8080);
