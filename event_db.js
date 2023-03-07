const sqlite3 = require("sqlite3").verbose();
console.log("Entered in event database");

let db = new sqlite3.Database("./assets/test.db", sqlite3.OPEN_READWRITE, (err)=>{
    if(err) return console.log(err.message);
});

var getStart = null, getEnd = null;

let sql = `CREATE TABLE IF NOT EXISTS EVENT(Sno Integer, start TIMESTAMP, end TIMESTAMP)`;
db.run(sql);
console.log("Connected to event database");

exports.insertEventdb = (start,end)=>{
  // Count existing rows start
  db.get(`SELECT COUNT(*) AS count FROM EVENT;`, [], (Err,Row) => {
    if (Err) {
      console.log(Err.message);
    }
    let count = Row ? Row.count : 0;

    // Insert Event start
    let Sql = `INSERT INTO EVENT(Sno, start, end) VALUES(?,?,?)`;
    db.run(Sql, [count + 1, start, end], (err) => {
      if (err) return console.error(err.message);
    });
    // Insert Event end
  });
}

exports.getEventdb = (current)=>{
  console.log("Entered in getevent");
    let Sql = `SELECT start,end FROM EVENT WHERE start <= ? AND end > ?;`;
    db.all(Sql, [current, current], (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      rows.forEach((row) => {
        console.log("HELLO--------------"+row.start +"  " + row.end);
        getStart = row.start;
        getEnd = row.end;
      });
      console.log("Got the event");
    });
    return {
      Start: getStart,
      End: getEnd,
    };
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
};

exports.deleteEventdb = () => {
  db.run("DELETE FROM EVENT", function (err) {
    if (err) {
      console.error(err.message);
    } else {
      console.log("All data deleted from EVENT table successfully.");
    }
  });
};

 
