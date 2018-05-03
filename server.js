
'use strict';
const pg = require('pg');
const express = require ('express');
const superagent = require('superagent');
const cors = require ('cors');
const jszip = require('jszip');
const fs = require('fs');

const app= express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL= process.env.CLIENT_URL;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

client.on('error', err=> console.error(err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//get ZIP by project id
app.get('/app/zip/:id', (req, res) => {
  console.log('params:', req.params.id);
  let id = req.params.id.split('')
  id = id[1];
  return createFile(id);
})

let createFile = project_id => {
  console.log('PID', project_id);
  return client.query('SELECT * FROM projects WHERE project_id = $1', [project_id])
  .then( result =>{
    let htmlTitle = result.rows[0].project_name;
    console.log('Head', htmlTitle);
    let htmlArr = JSON.parse(result.rows[0].html)
    console.log('Array', htmlArr);
    
    let htmlStr = htmlArr.reduce((a, element) => {
      console.log('A: ', a);
      console.log('Element: ', element);
      return a = `${a}
      ${element}`}, '')
    console.log('Body', htmlStr);
    let htmlPage = `
    <!DOCTYPE html>
    <html>
    <head>
    <title> ${htmlTitle}</title>
    </head>
    <body>
    ${htmlStr}
    </body>
    </html>`;
    console.log(htmlPage);
    fs.writeFile('index.html', htmlPage, function(err){
      if (err) throw err;
      console.log('Created Index for Zipping')
    })
  }
  ).catch(console.error)}

app.get('/users/:username', (request, response) => {
  client.query('SELECT * From users WHERE username=$1;',
    [
      request.params.username
    ])
    .then(results => {
      if(!results.rows[0].password) {
        throw new Error('Username does not exist.');
      } else if (request.query.password === results.rows[0].password) {
        let user = {
          user_id: results.rows[0].user_id,
          username: results.rows[0].username,
          email: results.rows[0].email
        };
        response.send(user);
      } else {
        throw new Error('Password does not match.');
      }
    })
    .catch(console.error);
});


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
app.get('/user/projects/:id', (req, res) => {
  client.query(`
  SELECT (project_id, project_name) FROM projects WHERE user_id = $1;
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
    request.params.username, request.body.email
  ])
    .then(results => {
      if ( parseInt(results.rows[0].count) > 0 ) {
        throw new Error('Account already exists');
      }
      else {
        let userObj = {
          username: request.params.username,
          email: request.body.email,
          password: request.body.password
        };
        return createUser(userObj, response, request);

      }
    })
    .catch(console.error);
});

let createUser = (userObj, response, request) => {
  return client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3);', [
    userObj.username,
    userObj.email,
    userObj.password
  ])
    .then(results => {
      client.query('SELECT * FROM users WHERE username=$1;',[
        userObj.username
      ])
        .then(result => {
          return(result.rows[0]);
        })
        .then(result => response.send(result));
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

