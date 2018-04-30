'use strict';
const pg = require('pg');
const express = require ('express');
const superagent = require('superagent');
const cors = require ('cors');

const app= express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL= process.env.CLIENT_URL;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

client.on('error', err=> console.error(err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/users', (request, response) => {
  client.query('SELECT * FROM users')
    .then(result => response.send(result.rows))
    .catch(console.error);
});

app.get('/', (request, response) => {
  client.query('SELECT * FROM users')
    .then(result => response.send(result.rows))
    .catch(console.error);
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));

app.listen(PORT, ()=> console.log(`server started on port ${PORT}`));



