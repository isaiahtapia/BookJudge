require('dotenv').config();

const path = require('path');
const express = require('express');
const {engine} = require('express-handlebars');
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const controllers = require('./controllers'); 

const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

// Inform Express.js on which template engine to use
app.engine('handlebars', engine({
  // any additional handlebars setup / helpers / params

}));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    }
  })
);

// turn on controllers
app.use(controllers); 

// turn on connection to db and server
sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});
