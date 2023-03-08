require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const path = require("path");
const nodemailer = require("nodemailer");
const MAIL = require(__dirname + "/mail.js");
const { google } = require("googleapis");
const user_db = require(__dirname + "/user_db.js");
const canditate_db = require(__dirname + "/canditate_db.js");
const event_db = require(__dirname + "/event_db.js");
const event = require(__dirname + "/event.js");
const app = express();
const logger = require('morgan');
const sqlite3 = require("sqlite3").verbose();
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const ejs = require('ejs');
let n = (Math.random() + 1) * 1000;
const otp = Math.floor(n);
let uvoterId = null;
// const indexRouter = require("./routes/index");
// const authRouter = require("./routes/auth");
const connect = require("connect");
const SQLiteStore = require('connect-sqlite3')(session);
const db = new sqlite3.Database("./assets/test.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.log(err.message);
});
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "My Secret",
    resave: false,
    saveUninitialized: false
    // store: new SQLiteStore({ db: "test.db", dir: "./assets/test.db" }),
  })
);
// Passport
app.use(passport.authenticate("session"));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});


app.get("/", function (_req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function (_req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/admin", function (_req, res) {
  // res.render("admin_index", {user:true});
   res.render("adminPage");
});
app.post("/admin", function (_req, res) {
  // res.render("admin_index", {user:true});

  res.render("adminPage");
});

app.post("/event", function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  if (name === "Admin182" && email === "admin.mail182@gmail.com") {
    res.render("adminaction");
  } else {
    // res.write("You are not alloewd to enter");
    res.sendFile(__dirname + "/index.html");
  }
});
app.get("/create_event", function(req,res){
  res.render("event");
});
app.get("/create_canditate", function(req,res){
  res.render("createCandidate");
});
app.post("/candidateList", function(req,res){
  canditate_db.insertCanditatedb(req.body.candidateName, req.body.partyName, req.body.symbol);
  res.redirect("/admin");
});

app.post("/calendar", function (req, res) {
  console.log("Entered in calendar post");
  let StartDate = req.body.start;
  let EndDate = req.body.end;
  console.log(StartDate + " " + EndDate);
  event_db.insertEventdb(StartDate, EndDate);
  var dateTime = event.Cal_event(StartDate, EndDate);
  console.log(dateTime["start"] + "   " + dateTime["end"]);
  res.sendFile(__dirname + "/index.html");
});

app.post("/user", function (_req, res) {
  res.render('signup');
});
app.get("/user", function (_req, res) {
  res.render("signup");
});


app.post("/signup", function (req, res, next) {
  const username = req.body.username;
  uvoterId = req.body.voterId;
  const uemail = req.body.email;
  const uage = req.body.age;
  const password = req.body.password;
  const ugender = req.body.gender;
  const salt = crypto.randomBytes(16);
  
      // Create a table
        // let sql = `CREATE TABLE IF NOT EXISTS users (username TEXT,voterID TEXT NOT NULL,email TEXT,age INTEGER, gender TEXT, password TEXT, salt TEXT, PRIMARY KEY(voterID));`;
        // db.run(sql);
        // console.log("Connected to user database");
  // Insert data into table
  // user_db.insertUserdb(uname, uvoterId, uemail, uage, ugender);

  // query the data
  // user_db.queryUserdb();

  let current = event.reqCurrentevent();
  let dateTime = event_db.getEventdb(current);
  if (current >= dateTime["Start"] && current < dateTime["End"]) {
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      function (err, hashedPassword) {
        if (err) {
          return next(err);
        }
        db.run(
          "INSERT INTO users (username, voterID, email, age, gender, password, salt, isVote) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            username,
            uvoterId,
            uemail,
            uage,
            ugender,
            hashedPassword,
            salt,
            "false",
          ],
          function (err) {
            if (err) {
              return next(err);
            }
            const user = {
              id: this.lastID,
              username: req.body.username,
            };
            console.log("Elements get inserted");
            req.login(user, function (err) {
              if (err) {
                return next(err);
              }
              // res.redirect("/");
            });
          }
        );
      }
    );
  console.log("User logged in");
    console.log(
      "start: " +
        dateTime["Start"] +
        "   " +
        " end: " +
        dateTime["End"] +
        "  " +
        " current: " +
        current
    );
    MAIL.mail(uemail, otp);
    res.render("verify");
  }

  else {
    res.render("failure");
  }
});
app.post("/verify", function (req, res) {

  const enterOtp = req.body.otp;
  let isVote;
  let sql = `SELECT isvote FROM users WHERE voterID = ?`;
  if (enterOtp == otp) {
    db.serialize(() => {
      db.get(sql, [uvoterId], (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        isVote = row.isVote === "true" ? true : false;
        console.log(isVote);
        
        // Inserting candidate data in vote.ejs start
        let data = [{}];
        // query the data
        db.all(`SELECT * FROM CANDITATE`, [], (Err, Rows) => {
          if (Err) return console.error(Err.message);
          Rows.forEach((Row) => {
            data.push({
              Sno: Row.Sno,
              Candidate_Name: Row.Canditate_Name,
              Party_Name: Row.Party_Name,
              Symbol: Row.Symbol,
            });
          });
          console.log(data);
          res.render("vote", {
            value: false,
            data: data,
            len: data.length,
          });
        });
        // Inserting candidate data in vote.ejs end

        return isVote;
      });
      console.log(isVote);
    });
  } else {
    res.render("failure", { content: "OTP is incorrect" });
  }
});

app.get("/new", function(req,res){
  let data = [{}];
  // query the data
  db.all(`SELECT * FROM CANDITATE`, [], (Err, Rows) => {
    if (Err) return console.error(Err.message);
    Rows.forEach((Row) => {
      data.push({
        Sno: Row.Sno,
        Candidate_Name: Row.Canditate_Name,
        Party_Name: Row.Party_Name,
        Symbol: Row.Symbol,
      });
    });
    console.log(data);
    res.render("vote", {
      value: false,
      data: data,
      len: data.length,
    });
  });
  //  let content = canditate_db.CandidateData();
  //  let candidateData = content["data"];
  //  let size = content["size"];
  
});

// app.get("/verify", function (req, res) {
//   if (req.isAuthenticated()) {
//     const enterOtp = req.body.otp;
//     let isVote;
//     let sql = `SELECT isvote FROM users WHERE voterID = ?`;
//     if (enterOtp == otp) {
//       db.serialize(() => {
//         db.get(sql, [uvoterId], (err, row) => {
//           if (err) {
//             return console.error(err.message);
//           }
//           isVote = row.isVote === "true" ? true : false;
//           console.log(isVote);
//           res.render("vote", { value: isVote });
//           return isVote;
//         });
//         console.log(isVote);
//       });
//     } else {
//       res.render("failure", { content: "OTP is incorrect" });
//     }
//   }
// });

//   // query
// canditate_db.queryCanditatedb();

// logout
app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
     const val = req.body.VAL;
     // update
     let response = canditate_db.updateCanditatedb(res,val, uvoterId);
     //query
     canditate_db.queryCanditatedb();
    //  Submit response
    user_db.submitVote(uvoterId);
    if(response == 0){
      res.redirect("/");
    }
    else{
      res.render("duplicate");
    }
  });
});
// app.post("/logout", function (req, res, next) {
//   const val = req.body.VAL;
//   // update
//   canditate_db.updateCanditatedb(val);
//   //query
//   canditate_db.queryCanditatedb();


//   // req.session.destroy();
//   // req.session.destroy((err) => {
//   //   res.redirect("/"); // will always fire after session is destroyed
//   // });
//   res.redirect("/");
//   // process.exit(0);
// });

// app.delete("/confirm", function(req, res) {
//   console.log("DELETE Request Called");
//   res.send('<h1>YOUR VOTE IS SUBMITTED </h1> <form action="/" method="post"><input class="btn"  type="submit" value="🏠 Go To Homepage"></form>');
// });

// result
app.get("/result", function (req, res) {
  // let AN = canditate_db.resultCanditatedb();
  // let SN = AN["SN"];
  // let MN = AN["MN"];
  
  // let obj = canditate_db.getWinner();

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
    res.render("result", {
      win: win,
      max: maxVote,
      size: win.length,
    });

  });

});
app.get("/update_data", function(req,res){
  res.render("deleteTable");
});
app.get("/deleteUser", function(req,res){
  user_db.deleteUserdb();
  res.redirect("/admin");
});
app.get("/deleteCanditate", function (req, res) {
  canditate_db.deleteCanditatedb();
  res.redirect("/admin");
});
app.get("/deleteEvent", function (req, res) {
  event_db.deleteEventdb();
  res.redirect("/admin");
});
app.listen(3000, function (_req, _res) {
  console.log("server is connected to port 3000");
});
