const express = require('express');
const Student = require('../models/student');
const multer = require("multer");
const Router = express.Router();
const maxSize = 2 * 1024 * 1024;
const csv = require('fast-csv');
const fs = require('fs');
const _ = require('lodash');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + '/public/assets/uploads/');
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

Router.post('/upload', uploadFile, async (req, res, next) => {
  try {
    let allPromises = [];
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    let fetchedData = await new Promise((resolve, reject) => {
      let allEntries = [];
      fs.createReadStream(req.file.path)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => reject(error))
        .on('data', row => allEntries.push(row))
        .on('end', rowCount => {
          console.log(`Parsed ${rowCount} rows`, rowCount);
          resolve(allEntries);
        });
    });
    for (let student of fetchedData) {
      let newStudent = Object.assign({}, {
        studentid: _.get(student, 'id', 0),
        name: _.get(student, 'name', ''),
        age: _.get(student, 'age', 0),
        mark1: _.get(student, 'mark1', 0),
        mark2: _.get(student, 'mark2', 0),
        mark3: _.get(student, 'mark3', 0),
      });
      allPromises.push(new Student(newStudent).toObject());
    }
    Student.collection.insertMany(allPromises).then((res) => {
      console.log('inserted successfully!');
    }).catch((err) => {
      console.log('err', err);
    });
    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
})

Router.get('/students/:id/result', async (req, res, next) => {
  try {
    if (_.isEmpty(req.params.id)) {
      return res.status(500).send({
        message: 'Please enter a valid a student id',
      });
    }
    const student = await Student.findOne({ studentid: req.params.id });
    if (student) {
      return res.status(200).send(student);
    }
    res.status(500).send({
      message: 'student id is invalid',
    });
  } catch (e) {
    res.status(500).send({
      message: 'there was an error while finding the student',
    });
  }
});

Router.get('/students', async (req, res, next) => {
  const { resultStatus } = req.query;
  try {
    let students = [];
    if (resultStatus === 'passed') {
      students = await Student.find({
        $and: [
          { mark1: { $gt: 35 } },
          { mark2: { $gt: 35 } },
          { mark3: { $gt: 35 } },
        ]
      });
    } else if (resultStatus === 'failed') {
      students = await Student.find({
        $or: [
          { mark1: { $lt: 35 } },
          { mark2: { $lt: 35 } },
          { mark3: { $lt: 35 } },
        ]
      });
    } else {
      students = await students.find({});
    }
    res.status(200).send(students);
  } catch (e) {
    res.status(500).send({
      message: 'there was an error while getting the students',
    });
  }
});



module.exports = Router;