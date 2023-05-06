const { google } = require("googleapis");
require("dotenv").config();
var dateTime;
var newstartDate = null, newendDate = null;

exports.Cal_event = function (startDate, endDate) {
  console.log("Entered in calendar js");
  // Provide the required configuration
  const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
  const calendarId = process.env.CALENDAR_ID;

  // Google calendar API settings
  const SCOPES = "https://www.googleapis.com/auth/calendar";
  const calendar = google.calendar({ version: "v3" });

  const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
  );

  // Your TIMEOFFSET Offset
  const TIMEOFFSET = "+05:30";
  console.log(startDate + " " + endDate);
  // Get date-time string for calender
  const dateTimeForCalander = () => {
    let date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
      day = `0${day}`;
    }
    let hour = date.getHours();
    if (hour < 10) {
      hour = `0${hour}`;
    }
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = `0${minute}`;
    }

    let newStartDateTime = `${startDate}:00.000${TIMEOFFSET}`;
    let event1 = new Date(Date.parse(newStartDateTime));
    newstartDate = event1;

    let newEndtDateTime = `${endDate}:00.000${TIMEOFFSET}`;
    let event2 = new Date(Date.parse(newEndtDateTime));
    newendDate = event2;

    return {
      start: newstartDate,
      end: newendDate,
    };
  };

  // Insert new event to Google Calendar
  const insertEvent = async (event) => {
    try {
      let response = await calendar.events.insert({
        auth: auth,
        calendarId: calendarId,
        resource: event,
      });

      if (response["status"] == 200 && response["statusText"] === "OK") {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      console.log(`Error at insertEvent --> ${error}`);
      return 0;
    }
  };

  dateTime = dateTimeForCalander();

  // Event for Google Calendar
  let event = {
    summary: `Online Voting Application`,
    description: `The voting will be conduct in this event`,
    start: {
      dateTime: dateTime["start"],
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: dateTime["end"],
      timeZone: "Asia/Kolkata",
    },
  };

  insertEvent(event)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });

  // Get all the events between two dates
  const getEvents = async (dateTimeStart, dateTimeEnd) => {
    try {
      let response = await calendar.events.list({
        auth: auth,
        calendarId: calendarId,
        timeMin: dateTimeStart,
        timeMax: dateTimeEnd,
        timeZone: "Asia/Kolkata",
      });

      let items = response["data"]["items"];
      return items;
    } catch (error) {
      console.log(`Error at getEvents --> ${error}`);
      return 0;
    }
  };

  // Delete an event from eventID
  const deleteEvent = async (eventId) => {
    try {
      let response = await calendar.events.delete({
        auth: auth,
        calendarId: calendarId,
        eventId: eventId,
      });

      if (response.data === "") {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      console.log(`Error at deleteEvent --> ${error}`);
      return 0;
    }
  };

  let eventId = "hkkdmeseuhhpagc862rfg6nvq4";

  deleteEvent(eventId)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });

   return dateTime;
};

// Current time start
 exports.reqCurrentevent = function() {
    // Your TIMEOFFSET Offset
    const TIMEOFFSET = "+05:30";
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
      day = `0${day}`;
    }
    // let hour = date.getHours() + 5;
    let hour = date.getHours();
    if (hour < 10) {
      hour = `0${hour}`;
    }
    // let minute = date.getMinutes() + 30;
     let minute = date.getMinutes();
    if (minute < 10) {
      minute = `0${minute}`;
    }

    let currDate2 = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;
    return currDate2.toString();
  };
  