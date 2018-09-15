const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.SERVER_PORT;
const bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
//const connectDb = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME;
//const connectDb = 'postgresql://marius:tomita@localhost:49914/marius-db'

// const pool = new Pool({ connectDb });
// const client = new Client({ connectDb });
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//fetch from pool
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT
});

//insert client
const client = new Client({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT
});
// client.connect()

// client.query('SELECT NOW()', (err, res) => {
// 	//console.log(err, res)
// 	client.end()
// })

app.get('/', (req, res) => {

	pool.query('SELECT * FROM users', (err, results) => {
		//console.log(err, res, 'from USERS @@@@@@@@@@@@@@@');
		//console.log(results.rows);
		for (let i = 0; i < results.rows.length; i++)
			console.log(results.rows[i].name);
		//console.log(results.rows);
		if (err)
			return res.json({
				success: false,
				err
			});
		return res.json({
			success: true,
			result: results.rows
		});
		pool.end();
	})
});

app.post('/user', (req, res) => {
	let insertUser = [req.body.name, req.body.password];
	client.connect();	
	//CONFLICT ON CONSTRAINT unique_name ON CONFLICT (name) DO NOTHING
	client.query('INSERT INTO users(name, password) VALUES($1, $2) ON CONFLICT (name) DO NOTHING RETURNING *', insertUser, (err, result) => {
		if (result.rows.length == 0) {
			return res.json({
				success: false,
				error: 'duplicate'
			});
			client.end();
		};
		//console.log(result.rows[0].name);
		if (err) {
			return res.json({
				success: false,
				err
			});
			client.end();
		}
		//console.log(err, result);
		//console.log(result.rows[0]);
		return res.json({
			success: true, 
			result: result
		});
		client.end();
	});
});

app.post('/table', (req, res) => {
// 	CREATE TABLE Persons (
//     PersonID int,
//     LastName varchar(255),
//     FirstName varchar(255),
//     Address varchar(255),
//     City varchar(255) 
// );
client.connect();
client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, name CHARACTER VARYING(200) NOT NULL, password CHARACTER VARYING(40) NOT NULL)', (err, result) => {
	if (err)
		return res.json({
			success: false,
			err
		});
	return res.json({
		success: true,
		result
	});
	client.end();
});
});


app.listen(port, () => {console.log('App started on port: ' + port)});