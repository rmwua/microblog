const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require ("body-parser");
const sqlite3 = require('sqlite3').verbose();


//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});


const authorRoutes = require('./routes/author');
const readerRoutes = require('./routes/reader');

app.use(express.static('public'));
// set parser
app.use(bodyParser.urlencoded({ extended: true }));

//set the app to use ejs for rendering
app.set('view engine', 'ejs');


// adds all the routes under the path /author
app.use('/author', authorRoutes);

// adds all the routes under the path /reader
app.use('/reader', readerRoutes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



