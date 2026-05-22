require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const studentRoutes = require('./api/routes/studentRoutes');
const inquiryRoutes = require('./api/routes/inquiryRoutes');
const accountRoutes = require('./api/routes/accountRoutes');
const userGroupRoutes = require('./api/routes/userGroupRoutes');


const app = express();
const port = process.env.PORT || 3002;


app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(cookieParser());

app.use('/api/students', studentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/groups', userGroupRoutes);


app.listen(port);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

console.log(`Server started on port ${port}`);
