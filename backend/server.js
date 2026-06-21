require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const studentRoutes = require('./api/modules/student/studentRoutes');
const inquiryRoutes = require('./api/modules/inquiry/inquiryRoutes');
const accountRoutes = require('./api/modules/account/accountRoutes');
const userGroupRoutes = require('./api/modules/group/userGroupRoutes');
const roleRoutes = require('./api/modules/role/roleRoutes');
const authRoutes = require('./api/modules/auth/authRoutes');
const cityRoutes = require('./api/modules/city/cityRoutes');
const schoolRoutes = require('./api/modules/school/schoolRoutes');
const sourceDataRoutes = require('./api/modules/sourceData/sourceDataRoutes');

const app = express();
const port = process.env.PORT || 3003;


app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(cookieParser());
require('./config/passport')(passport);
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/groups', userGroupRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/source-data', sourceDataRoutes);

app.listen(port);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

console.log(`Server started on port ${port}`);
