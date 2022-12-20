const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { response } = require('express');

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'eval'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs')
app.get('/', function(request, response) {
	return response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/login.html', function(request, response) {
	return response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/admin-login.html', function(request, response) {
	return response.sendFile(path.join(__dirname + '/admin-login.html'));
});

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		connection.query(`SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}'`, function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				return response.redirect('/home');
			} else {
				return response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		return response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/admin-auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		connection.query(`SELECT * FROM admin_accounts WHERE username = '${username}' AND password = '${password}'`, function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				return response.redirect('/admin-home');
			} else {
				return response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
    	// return response.sendFile(path.join(__dirname + '/homepage.html'));
		// connection.query(`select * from passengers where from_d = 'vidyanagar' and to_d = 'airport';`, function(error, results, fields) {
		// 	if(error) {
		// 		console.log(error);
		// 		return;
		// 	}
		// 	var rows = JSON.parse(JSON.stringify(results));
		// 	response.render("homepage");
		// 	response.end();
		// });
			return response.render("homepage");

	} else {
		return response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/admin-home', function(request, response) {
	if (request.session.loggedin) {
    	// return response.sendFile(path.join(__dirname + '/admin-homepage.html'));
        return response.render("homepage");


	} else {
		return response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/services', function(request, response) {
    // return response.sendFile(path.join(__dirname + '/services.html'));
	// response.end();
	connection.query(`select * from passengers where from_d = 'vidyanagar' and to_d = 'airport';`, function(error, results, fields) {
        if(error) {
            console.log(error);
            return;
        }
        var rows = JSON.parse(JSON.stringify(results));
		console.log(rows);
        return response.render("services",{ table: rows });
	    response.end();
    });
});

app.get('/rentals', function(request, response) {
    // response.sendFile(path.join(__dirname + '/rentals.html'));
    // response.write('Hello');
    // var table = connection.query(`select * from passengers;`);
    connection.query(`select * from passengers;`, function(error, results, fields) {
        if(error) {
            console.log(error);
            return;
        }
        var rows = JSON.parse(JSON.stringify(results));
		console.log(rows);
        return response.render("rentals",{ table: rows });
	    response.end();
    });

});


app.post("/book", (req, res) => {
    const name = req.body.inputName.trim()
    const from = req.body.inputFrom.trim()
    const to = req.body.inputTo.trim()
    const kms = Number(req.body.inputKms)
	var fare = 0
	if(kms < 100){
		fare = 300
	}else{
		fare = 500
	}
	var variableName
    connection.query(`insert into passengers values('${name}','${from}','${to}',${kms},${fare});`,()=>{
		res.render("homepage", { variableName: "Booked Succesfully." })
	})
	// , ()=> {
		// response.send("Booked Succesfully.")			
		// response.end();
	// });

})

app.listen(3000,()=>console.log('Listening on port 3000.'));
