const pathing = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');


const app = express();
const port = process.env.PORT || 3000;

// load config
dotenv.config({ path: './config/config.env' })

// passport config
require('./config/db')(passport);



// try call db
connectDB();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// methdo overridder
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// handlebar helpers
const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  } = require('./helpers/hbs')


// handlebars
app.engine(
    '.hbs',
    exphbs({
      helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select,
      },
      defaultLayout: 'main',
      extname: '.hbs',
    })
  )
app.set('view engine', '.hbs');




// seesion
app.use(session({
    secret: "make good story for everyone",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// passport middlware
app.use(passport.initialize());
app.use(passport.session())

// set global var

app.use((req,res,next)=>{
    res.locals.user = req.user || null
    next()
})


// static folder
app.use(express.static(pathing.join(__dirname, 'public')))

// route
app.use('/', require('./route/index'));
app.use('/auth', require('./route/auth'));
app.use('/stories', require('./route/stories'));

app.listen(port, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${port} `);
});
