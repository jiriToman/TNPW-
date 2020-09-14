const express = require("express");
const app = express();
const port = 8000;
const hbs = require("hbs");
//mongoose init
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/tnpw", { useNewUrlParser: true });
const db = mongoose.connection;
//naimportovani mongoose schematu
const User = require("./userSchema.js");
//body parser pro nacitani z dokumentu
const bodyParser = require("body-parser");
//express session pro uchovavani user/session id bezpecne v cookies
var session = require("express-session");
const jwt = require("jsonwebtoken");
//check jestli jsem pripojeny k db
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("we are connected!");
});
//body parser init pro obe moznosti
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//express session init
app.use(
  session({
    secret: "tnpw2",
    resave: true,
    saveUninitialized: false,
  })
);


// tady mam auth failuje na .replace tvrdi ze header neexistuje
// const auth = async (req, res, next) => {
//   console.log('token: ' +JSON.stringify(req.header("Authorization").replace("Bearer ", "")));
//   console.log('decoded: ' +JSON.stringify(jwt.verify(token, "tnpw2")));
//   try {
//     const token = req.header("Authorization").replace("Bearer ", "");
  
//     const decoded = jwt.verify(token, "tnpw2");
//     const user = await User.findOne({
//       _id: decoded._id,
//       "tokens.token": token,
//     });
//     if (!user) {
//       throw new Error("no user found");
//     }
//     req.token = token;
//     req.user = user;
//     next();
//   } catch (e) {
//     res.status(401).send({ error: "Verify your identity: "+ e });
//   }
// };


//hbs init a priprava frontendovych komponent
app.use(express.static("resources"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials", function (err) {});
//obsluha postu na dane adrese

app.post("/", (req, res, next) => {
  console.log("email: " + req.body.email + " password: " + req.body.password);
  if (req.body.password !== req.body.passwordII) {
    //check jestli se hesla shoduji a odeslani erroru https://expressjs.com/en/guide/error-handling.html
    var err = "Please enter the same password twice.";
    res.send(err);
  } else if (req.body.email && req.body.password && req.body.passwordII) {
    // pokud jsou vsechna potrebna data ulozim je do UserData a poslu do mongo a vytvarim noveho usera
    var userData = {
      email: req.body.email,
      password: req.body.password,
    };

    User.create(userData, async function (err, user) {
      if (err) {
        return next(err);
      } else {
        //pokud vse probehne ok ulozim user is do sessiony a otevru user profil
        req.session.userId = user._id;
        const token = await user.generateAuthToken();
        return res.redirect("/profile");
      }
    });
  }
});
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
         const token = await user.generateAuthToken();
         return res.redirect("/profile");
      }
    });
  } else {
    var err = "Something is missing.";
    return next(err);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile",  (req, res, next) => {
  //sem bych umistil auth, za profile",
  // najdu user id pokud neni pritomne nebo je nespravne vyhodi error
  // console.log(req.session.userId);
  if (!req.session.userId) {
    return res.render("error", { error: " nejste prihlaseny " });
  } else {
    User.findById(req.session.userId).exec(function (error, user) {
      // console.log(JSON.stringify(user));
      if (error) {
        return next(error);
      } else {
        // console.log(JSON.stringify(user));
        return res.render("home", { user: user });
      }
    });
  }
});
//pridavani novych frazi(pokud fraze existuje  update stavajici podle hodnoty v en)
app.post("/profile", (req, res, next) => {
  console.log(req.body.englishp);
  var phraseData,
    remove = req.body.englishp;
  if (!req.body.enp && !req.body.englishp) {
    var err = "Please enter an english phrase";
    res.send(err);
  } else if (
    (req.body.enp && req.body.csp) ||
    (req.body.enp && req.body.dep) ||
    remove
  ) {
    if (req.body.enp && req.body.csp && req.body.dep) {
      var phraseData = {
        germanP: req.body.dep,
        englishP: req.body.enp,
        czechP: req.body.csp,
      };
    } else if (req.body.enp && req.body.csp && !req.body.dep) {
      var phraseData = {
        englishP: req.body.enp,
        czechP: req.body.csp,
      };
    } else if (req.body.enp && req.body.dep && !req.body.csp) {
      var phraseData = {
        englishP: req.body.enp,
        germanP: req.body.dep,
      };
    }
    User.findById({ _id: req.session.userId }, function (err, user) {
      let found = false,
        end = false ;
      if (err) {
        return res.send(err);
      } else if (!user) {
        return res.send("uzivatel nenalezen");
      } else {
        // console.log(JSON.stringify(user.phrases));
        for (var i = 0; i < user.phrases.length; i++) {
          //update fraze
          if (phraseData) {
            if (user.phrases[i].englishP === phraseData.englishP) {
              console.log("rovna se fraze");
              if (phraseData.czechP) {
                user.phrases[i].czechP = phraseData.czechP;
              }
              if (phraseData.germanP) {
                user.phrases[i].germanP = phraseData.germanP;
              }
              found = true;
            }
          } else if (remove === user.phrases[i].englishP) {
            console.log("removing "+JSON.stringify(user));
            found = true;
            let target = user.phrases[i]._id;
            user.phrases.pull(target);

          }else{
            console.log(user.phrases[i]);
            
          }
          if (i == user.phrases.length - 1) {
            end = true;
          }
        }

        if ((end == true && found == false) || user.phrases.length == 0) {
          console.log("melo by se pridat delka " + user.phrases.length);
          user.phrases.push(phraseData);
          found = true;
        } else if (found == false) {
          console.log("neprobehlo pridani");
        }
        user.save();
        res.redirect("back");
      }
    });
  }
});

app.get("/cls", async (req, res) => {
  await User.deleteMany({});
  return res.send("cleared");
});
app.listen(port, () => console.log(`App listening to port ${port}`));

// cmd  pro export dbs cd C:\Program Files\MongoDB\Server\4.2\bin
//  mongoexport --collection=users --db=tnpw --out=C:\Users\toman\Desktop\TNPW_Project\users.json
