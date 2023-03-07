const sqlite3 = require("sqlite3").verbose();
let uvoterId = "";
  console.log("enter in userdb");
  let db = new sqlite3.Database("./assets/test.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
  });
 // Create a table
      let sql = `CREATE TABLE IF NOT EXISTS users (username TEXT,voterID TEXT NOT NULL,email TEXT,age INTEGER, gender TEXT, password TEXT, salt TEXT,isVote TEXT, PRIMARY KEY(voterID));`;
      db.run(sql);
      console.log("Connected to user database");

  exports.insertUserdb = (uname, uvoterId, uemail, uage, ugender) => {
    // Insert data into table
    let Sql = `INSERT INTO users(cname,voterID,email,age,gender, isVOTE) VALUES(?,?,?,?,?,?)`;
    db.run(Sql, [uname, uvoterId, uemail, uage, ugender], (err) => {
      if (err) return console.error(err.message);
    });
    console.log("Elements get inserted");

  };

  exports.queryUserdb = () => {
    // query the data
    let Sql = `SELECT * FROM users`;
    db.all(Sql, [], (err, rows) => {
      if (err) return console.error(err.message);
      rows.forEach((row) => {
        console.log(row);
      });
    });
    // res.send(`SELECT * FROM users`);
  };

  exports.dropUserdb = () => {
    // Drop a table
    db.run("DROP TABLE users");
    // close database
      db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log("Closed the database connection.");
      });
    //Delete from table
  };

  // Submit response
  exports.submitVote = (getID) => {
    db.serialize(() => {
      let sql = `UPDATE users SET isVote = 'true' WHERE voterID = ?`;

      db.run(sql, [getID], function (err) {
        if (err) {
          return console.error(err.message);
        }
      //  document.reload()
      });
    });
  }
  // Check Vote Submitted or not
  exports.isSubmit = (res,getID) => {
    // let isVote = "";
   db.serialize(() => {
     db.get(
       `SELECT isVote FROM users WHERE voterID = ?`,
       [getID],
       (err, row) => {
         if (err) {
           return console.error(err.message);
         }
         let isvote = row.isVote === "true" ? true : false;
         console.log(isvote);
         if(!isvote){
          res.render("vote");
         }
         return isvote;

       }
     );
   });
  };

  exports.deleteUserdb = () => {
    db.run("DELETE FROM users", function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log("All data deleted from user table successfully.");
      }
    });
  }

 