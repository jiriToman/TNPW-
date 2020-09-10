const express = require('express');
const app = express();
const port = 3000;
const hbs = require('hbs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tnpw', {useNewUrlParser: true});
const db = mongoose.connection;
const User = require('./userSchema.js');
const bodyParser = require('body-parser');
var session = require('express-session');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log('we are connected!');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'tnpw2',
  resave: true,
  saveUninitialized: false
}));

app.use(express.static('resources'))
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials', function (err) {});



app.post('/', (req, res,next) => {
  console.log('email: ' + req.body.email + ' password: '+
   req.body.password);
  if (req.body.password !== req.body.passwordII) {
    var err = new Error('Please enter the same password twice.');
    err.status = 400;
    res.send(err);
  }else if (req.body.email && req.body.password && req.body.passwordConf) {  
      var userData = {
      email: req.body.email,
      password: req.body.password,
      passwordII: req.body.passwordII,
     
      }  

      User.create(userData, function (err, user) {
        if (err.code==11000) {
          res.send('uzivatel existuje')}
          else if (err.code !=null || err.code!=11000){
          return next(console.log(err));
        } else {
          return res.redirect('/profile');
        }
  });
}
  


  })
  app.post('/login', urlencodedParser, function (req, res) {
    // res.send('welcome, ' + req.body.username);
    

    if (req.body.email && req.body.password) {
      User.authenticate(req.body.email, req.body.password, function (error, user); 
    }else if (req.body.logemail && req.body.logpassword) {
      User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
        if (error || !user) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          return next(err);      
        } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
          }
        });
      } else { 
        var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
  })


  })


app.get('/', (req, res) => {
   
    
    res.render('index');
    
  
    });
  
    app.get('/profile', (req, res) => {
   
    
        res.send('haha');
          
      
        });

app.listen(port, () => console.log(`App listening to port ${port}`));
// https://medium.com/createdd-notes/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359