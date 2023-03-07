const sqlite3 = require("sqlite3").verbose();
console.log("enter in canditatedb");
let db = new sqlite3.Database("./assets/test.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});
//  let max = 0;
//  let SN = [0], MN = [0];
 let response = 0;

//create table
let sql = `CREATE TABLE IF NOT EXISTS CANDITATE (
  Sno INTEGER, 
  Canditate_Name STRING,
  Party_Name VARCHAR NOT NULL,
  Symbol image,
  Vote INTEGER,
  PRIMARY KEY(Party_Name)
  )`;
db.run(sql);
console.log("Connected to canditate database");

exports.insertCanditatedb = (candidateName, partyName, symbol) => {
  // count rows
  let sql1 = 'SELECT COUNT(*) AS count FROM CANDITATE';
// Execute the query
db.get(sql1, [], (err, row) => {
  if (err) {
    console.error(err.message);
  }
  // Get the count from the row object
  let count = row ? row.count : 0;
  console.log(`The count is ${count}`);

  // Insert data into table
  let Sql = `INSERT INTO CANDITATE(Sno,Canditate_Name,Party_Name, Symbol,Vote) VALUES(?,?,?,?,?)`;
  db.run(Sql, [count + 1, candidateName, partyName, symbol, 0], (Err) => {
    if (Err) return console.error(Err.message);
  });
});
    //  db.run(Sql, [2, "Canditate 2", "Party 2", "Symbol 2", 0], (err) => {
    //    if (err) return console.error(err.message);
    //  });
    //   db.run(Sql, [3, "Canditate 3", "Party 3", "Symbol 3", 0], (err) => {
    //     if (err) return console.error(err.message);
    //   });
  console.log("Elements get inserted");
};

 exports.queryCanditatedb = () => {
    // query the data
    let Sql = `SELECT * FROM CANDITATE`;
    db.all(Sql, [], (err, rows) => {
      if (err) return console.error(err.message);
      rows.forEach((row) => {
        console.log(row);
      });
    });
};

exports.updateCanditatedb = (res,val, getID) => {
  // if(getID != null){
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
           if (!isvote) {
            // update vote start
            let Sql =
              `UPDATE canditate SET Vote = (Vote+1) WHERE Sno = ` + val + `+1;`;
            db.run(Sql, [], function (err) {
              if (err) {
                return console.error(err.message);
              }
              console.log(`Row(s) updated: ${this.changes}`);
            });
            // update vote end
           }
           else{
            response = 1;
            console.log("error vote again");
            // res.render("duplicate");
           }
           return response;
         }
       );
     });
  // }
  return response;
};

// exports.resultCanditatedb = () => {
//  let max_value = 0, max = 0;
//   // Max
//   let sql1 = `SELECT MAX(vote) AS max_value FROM CANDITATE;`;
//   db.get(sql1, (err, result) => {
//     if (err) {
//       console.log(err.message);
//     }
//     console.log("The maximum value in vote is: " + result.max_value);
//     max = result.max_value;
//   });

//   let sql2 = `SELECT Sno, vote FROM CANDITATE WHERE vote = ?;`;
//   db.all(sql2, [max], (err, rows) => {
//     if (err) {
//       console.log(err.message);
//     }
//     rows.forEach((row) => {
//       for(i = 0; i< SN.length; i++) {
//         if(row.Sno == SN[i]) {
//            return {
//              SN: SN,
//              MN: MN,
//            };
//         }
//       }
//       SN.push(row.Sno);
//       MN.push(row.vote);
//     });
//   });
//   return {
//     SN : SN,
//     MN : MN
//   }
// }

exports.getWinner = () =>{
  // const db = new sqlite3.Database(dbFile, (err) => {
  //   if (err) {
  //     return callback(err);
  //   }
  // });

  let query = "SELECT Sno, Vote FROM CANDITATE ORDER BY Vote DESC";
  db.all(query, [], (err, rows) => {
    if (err) {
      return callback(err);
    }

    let win = [];
    let maxVote = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].Vote > maxVote) {
        maxVote = rows[i].Vote;
        win = [rows[i].Sno];
      } else if (rows[i].Vote === maxVote) {
        win.push(rows[i].Sno);
      }
    }

    console.log("The maximum value in vote is: " + maxVote);
    console.log("Winning team is " + win[0]);
    // res.render("result", { win: win });
    // if(win.length > 1){
      return{
        win : win,
        max : maxVote,
        size : win.length
      };
    // }
    // else{
    //   return win[0];
    // }
    // db.close((err) => {
    //   if (err) {
    //     return callback(err);
    //   }
    //   callback(null, win);
    // });
  });
}

exports.dropCanditatedb = () => {
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

// exports.clearResult = () =>{
//   for(i=0;i<= SN.length;i++) {
//     SN.pop();
//     MN.pop();
//   }
// }

exports.deleteCanditatedb = () => {
  db.run("DELETE FROM CANDITATE", function (err) {
    if (err) {
      console.error(err.message);
    } else {
      console.log("All data deleted from CANDIDATE table successfully.");
    }
  });
};