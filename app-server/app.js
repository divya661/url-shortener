const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const constants = require('./constants');
const db_config = require('./db_config');
const urlShortenerRouter = require('./routes/urlShort');
//const favicon = require('express-favicon'); 
const app = express();
const index = require('./routes/index');
const router = require('./routes/index');
const favicon = require('serve-favicon');
//app.use(favicon(__dirname + '/public/favicon.png'));
app.use(cors())

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public','images', 'favicon.ico')));
app.use('/', index);
//app.use('/add',urlShort)
app.use('/urlShort', urlShortenerRouter);

//Add your routes here, etc.
 
// app.listen(8000, function(){
//     console.log('server is running at %s .', server.address().port);
// });

//app.listen(3500);
//console.log("Started listening at port 3500");

module.exports = app;
