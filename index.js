const express = require('express');
const app = express();
const port = 3000;
const hbs = require('hbs');
app.use(express.static('public'))//Sets a basic route
app.get('/', (req, res) => res.send('Hello World !'));

app.listen(port, () => console.log(`App listening to port ${port}`));