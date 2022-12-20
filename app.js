const express = require('express');

const app = express();

const cookieParser = require('cookie-parser')

app.use(express.json());
app.use(express.urlencoded({extented: true}));
app.use(cookieParser())

//Importing Routes

const post = require('./route/post');
const user = require('./route/user');

// use Routes
app.use('/api/v1', post);
app.use('/api/v1', user);

module.exports = app