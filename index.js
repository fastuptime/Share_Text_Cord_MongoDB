const config = require('./config.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
////// MIDDLEWARE //////

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './www');

////// DATABASE //////
mongoose.connect(config.mongoUrl, { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

let textSchema = new mongoose.Schema({
    name: String,
    text: String,
    updated_at: { type: String, default: moment().format('DD/MM/YYYY HH:mm:ss') },
    createDate: { type: String, default: moment().format('DD/MM/YYYY HH:mm:ss') }
});

let Text = mongoose.model('Text', textSchema);

////// ROUTES GET //////
app.get('/', async (req, res) => {
  let shares = await Text.find({}).sort({_id: -1});
  res.render('index.ejs', { config, shares });
});

app.get('/show/:id', async (req, res) => {
    if(!req.params.id) return res.status(400).send('No ID provided');
    let text = await Text.findOne({ _id: req.params.id });
    if(!text) return res.status(404).send('No text found');
    res.render('show.ejs', { config, text });
});

////// ROUTES POST //////

app.post('/create', async (req, res) => {
    const { name, text } = req.body;
    if (!name || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    let newText = new Text({
        name,
        text
    });
    try {
        newText = await newText.save();
        return res.redirect(`/show/${newText._id}`);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

////// SERVER //////

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}!`);
});