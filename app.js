
const express = require('express');
require('./db/mongoose');
const cors = require('cors');
const studentRouter = require('./controllers/student');

const app = express();

global.__basedir = __dirname;


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(studentRouter);


app.listen(8081, () => {
  console.log('app is listening at 8081');
})