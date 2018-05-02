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


app.put('/app/data/:id', (req, res) =>{
  // console.log('in app/data/:id')
  client.query(`UPDATE projects
  SET html = $1 
  WHERE project_id = $2;`, [req.body.html, req.params.id])
    .then(() => res.send('Project Updated'))
    .catch(console.error);

});

app.get('/app/project/:id', (req, res) => {
  console.log(`In get for ${req.params.id}`);
  client.query(`
    SELECT * FROM projects
   WHERE project_id = $1;
  `,
  [req.params.id])
    .then( result => res.send(result.rows))
    .catch(console.error);
});

//get all projects
app.get('/app/user/projects/:id', (req, res) => {
  client.query(`
  SELECT (project_id, name) FROM projects WHERE project_id = $1;
  `,[
    req.params.id
  ])
    .then(result => res.send(result.rows))
    .catch(console.error);
});

//delete one project
app.delete('/app/user/projects/delete/:id', (req, res) => {
  client.query(`
  DELETE FROM projects WHERE project_id =$1;
  `,[
    req.params.id
  ])
    .then(result => res.send('delete successful'))
    .catch(console.error);
});

//delete all projects
app.delete('/app/user/delete/:id', (req, res) => {
  client.query(`
  DELETE * FROM projects WHERE user_id = $1;
  `, [
    req.params.id
  ])
    .then(result => res.send('delete all successful'))
    .catch(console.error);
});

app.post('/users/:username', (request, response) => {
  client.query('SELECT count(*) FROM users WHERE username=$1 OR email=$2', [
    request.params.username, request.params.email
  ])
    .then(results => {
      if ( parseInt(results.rows[0].count) > 0 ) {
        throw new Exception('Account already exists');
      }
      else {
        console.log('Creating New User', request.params.username);
        createUser(request, response);
      }
    })
    .catch(response.send('Username or Password already exists'));
});

let createUser = (request, response) => {
  client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3);', [
    request.body.username,
    request.body.email,
    request.body.password
  ])
    .then(results => {
      console.log('Selecting created user')
      client.query('SELECT * FROM users WHERE username=$1;',[
      request.body.username
    ])
      .then(result => {
        console.log(result.rows);
        response.send(result.rows)})
      .catch(console.error)
    })
    .catch(console.error);
};

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



