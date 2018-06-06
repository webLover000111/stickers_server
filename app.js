var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
const cors = require('cors');

const Index = require('./routes/index');
const Logup = require('./routes/logup');
const Login = require('./routes/login');
const CreateGif = require('./routes/createGif');
const CreateImg = require('./routes/createImg');
var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ type: 'application/*+json' }));
/* app.use('/', express.static(path.join(__dirname,'client'))); */
/* app.use(session({
    secret :  'secrect',
    resave : true,
    saveUninitialized: false,
    cookie : {
        maxAge : 3600*2,
    }
})); */
/* app.use(serveStatic(path.join(__dirname, 'client/assets'))); */
app.use('/', Index);
app.use('/index', Index);
app.use('/main', Index);
app.use('/logup', Logup);
app.use('/login', Login);
app.use('/create_gif',CreateGif);
app.use('/create_img', CreateImg);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(3001, () => {
  console.log('start server on 3001 successfully!');
});
module.exports = app;
