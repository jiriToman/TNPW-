const express = require('express');
const app = express();
const port = 3000;
const hbs = require('hbs');
app.use(express.static('resources'))//Sets a basic route
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials', function (err) {});

app.get('/', (req, res) => res.send('Hello World !'));

app.listen(port, () => console.log(`App listening to port ${port}`));