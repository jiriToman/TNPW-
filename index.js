const express = require('express');
const app = express();
const port = 8000;
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
    var err = new Error("Please enter the same password twice.");
    err.status = 400;
    res.send(err);
  } else if (req.body.email && req.body.password && req.body.passwordII) {
    var userData = {
      email: req.body.email,
      password: req.body.password,
      passwordII: req.body.passwordII,
    };

    User.create(userData, function (err, user) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/profile");
      }
    });
  }
  


  })
  app.post("/login", function (req, res, next) {
    //pokud je pritomny email a heslo provedu autentizaci
    if (req.body.email && req.body.password) {
      User.authenticate(req.body.email, req.body.password, async function (
        error,
        user
      ) {
        if (error) {
          var err = "You entered incorrect login information: " + error;
          return next(err);
        } else if (!user) {
          var err = "Unable to find user";
          return next(err);
        } else {
          //pokud je vse ok otevru user profil
          req.session.userId = user._id;
          // const token = await user.generateAuthToken();
          return res.redirect("/profile");
        }
      });
    } else {
      var err = "Something is missing.";
      return next(err);
    }
  });


app.get('/', (req, res) => {
   
    
    res.render('index');
    
  
    });
  
    app.get('/profile', (req, res) => {
   
    
        res.send('haha');
          
      
        });

app.listen(port, () => console.log(`App listening to port ${port}`));
// https://medium.com/createdd-notes/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359