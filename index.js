const express = require("express");
const app = express();
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");

let port = 8080;
app.listen(port, (req, res) => {
  console.log("server is listening to port" + port);
});
const connection = mysql.createConnection({
  host: "career-corps.ceuhuc9ptcr5.eu-north-1.rds.amazonaws.com",
  user: "admin",
  database: "career_corps",
  password: "Kavya123",
});
const path = require("path");
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ express: true }));
app.use(express.json());
//home page
app.get("/", (req, res) => {
  res.render("home.ejs");
});
//firsr page buttons
app.get("/home/emplogin", (req, res) => {
  res.render("employeelogin.ejs");
});
app.get("/home/hrlogin", (req, res) => {
  res.render("hrlogin.ejs");
});
app.get("/home/adminlogin", (req, res) => {
  res.render("adminlogin.ejs");
});
app.get("/home/studentlogin", (req, res) => {
  res.render("studentlogin.ejs");
});
//login pages of all 4 peoples
app.post("/home/emplogin/:employeeID", (req, res) => {
  const { employeeID, password } = req.body;
  const loginTime = new Date();
  let q = `SELECT * FROM employee_data WHERE Employee_ID = ?  AND password = ? `;
  const values = [employeeID, password];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    if (result.length === 1) {
      const data = result[0];

      // Compare hashed passwords here (recommended to use a library like bcrypt)
      if (password === data.password) {
        return res.render("employee1.ejs", { data, loginTime });
      }
    }

    return res.status(401).send("Wrong ID or password");
  });
});
app.post("/home/hrlogin/:hrID", (req, res) => {
  const { hrID, password_hr } = req.body;

  const q1 = "SELECT * FROM hr_data WHERE username = ? AND password = ?";
  const q2 = "SELECT COUNT(*) AS total FROM employee_data";

  const values1 = [hrID, password_hr];

  connection.query(q1, values1, (err1, result1) => {
    if (err1) {
      console.error(err1);
      return res.status(500).send("Database error");
    }

    if (result1.length === 1) {
      const data = result1[0];
      // Compare hashed passwords here (recommended to use a library like bcrypt)
      if (password_hr === data.password) {
        // If authentication is successful, proceed with the second query
        connection.query(q2, (err2, result2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).send("Database error");
          }
          const total = result2[0].total;
          return res.render("hr.ejs", { data, total });
        });
      } else {
        return res.status(401).send("Wrong ID or password");
      }
    } else {
      return res.status(401).send("Wrong ID or password");
    }
  });
});
app.post("/adminpage", (req, res) => {
  const { userID, password } = req.body;
  let q = `SELECT * FROM admin_data WHERE userID = ?  AND password = ? `;
  const values = [userID, password];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    if (result.length === 1) {
      const data = result[0];

      // Compare hashed passwords here (recommended to use a library like bcrypt)
      if (password === data.password) {
        return res.render("adminpage1.ejs", { data });
      }
    }

    return res.status(401).send("Wrong ID or password");
  });
});
app.post("/studentpage1", (req, res) => {
  const { studentID, password } = req.body;
  let q = `SELECT * FROM student_data WHERE student_id = ?  AND password = ? `;
  const values = [studentID, password];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    if (result.length === 1) {
      const data = result[0];

      // Compare hashed passwords here (recommended to use a library like bcrypt)
      if (password === data.password) {
        return res.render("studentpage1.ejs", { data });
      }
    }

    return res.status(401).send("Wrong ID or password");
  });
});

//mark student attendence
app.post("/student/attendance", (req, res) => {
  const { student_id, status, name } = req.body;
  const today = new Date();
  const attendance_date = today.toISOString().split("T")[0];

  const query =
    "INSERT INTO student_attendance (student_id, attendance_date, status , name) VALUES (?, ?, ?,?)";
  connection.query(
    query,
    [student_id, attendance_date, status, name],
    (err, results) => {
      if (err) {
        console.error( err);
        res.status(500).json({ error: "Error marking attendance" });
      } else {
        res.json({ message: "Attendance marked successfully" });
      }
    }
  );
});
//mark employeee attendence from employee page
app.post("/markAttendance", (req, res) => {
  const { employee_id, status } = req.body;
  const today = new Date();
  const loginTime = new Date().toLocaleTimeString();

  const attendance_date = today.toISOString().split("T")[0];

  const query =
    "INSERT INTO attendance (employee_id, attendance_date, status,in_time) VALUES (?, ?, ?,?)";
  connection.query(
    query,
    [employee_id, attendance_date, status, loginTime],
    (err, results) => {
      if (err) {
        console.error("Error marking attendance: " + err);
        res.status(500).json({ error: "Error marking attendance" });
      } else {
        res.json({ message: "Attendance marked successfully" });
      }
    }
  );
});

//add employee
app.get("/home/form", (req, res) => {
  res.render("form.ejs");
});
app.get("/home/hradd/form", (req, res) => {
  res.render("hrAddForm.ejs");
});
app.get("/home/adminadd/form", (req, res) => {
  res.render("adminAddForm.ejs");
});

app.post("/form/submit", (req, res) => {
  let { name, email, mobile, courses, message, employeeID } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO employee_data (Employee_Name ,Employee_ID ,email, phone_no, designation,Joining_Date) VALUES ( "${name}", ${employeeID}, "${email}" ,${mobile}, "${courses}","${message}")`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while adding data.");
    } else {
      res.send("Data added successfully.");
    }
  });
});

app.post("/form/hr/submit", (req, res) => {
  let { username, email, mobile, courses, joiningDate, employeeID } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO hr_data (id,username,email, phone_no, designation,Joining_Date) VALUES (${employeeID}, "${username}", "${email}" ,${mobile}, "${courses}","${joiningDate}")`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while adding data.");
    } else {
      res.send("Data added successfully.");
    }
  });
});

//search employee from HR page
app.post("/hrPage/:empID", (req, res) => {
  const emp_id = req.body; // Assuming 'emp_id' is the key in req.body
  let id = emp_id.employee_search;
  const q = `SELECT * FROM employee_data WHERE Employee_ID=${id}`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error occurred while retrieving data.");
    }
    // Render the "searchemployee.ejs" template and pass 'emp_id' and 'result' to it
    res.render("searchemployee.ejs", { id, result });
  });
});

//search student from HR page
app.post("/studentpage/details", (req, res) => {
  const emp_id = req.body; // Assuming 'emp_id' is the key in req.body
  let id = emp_id.student_search;
  const q = `SELECT * FROM student_data WHERE student_id=${id}`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error occurred while retrieving data.");
    }
    // Render the "searchemployee.ejs" template and pass 'emp_id' and 'result' to it
    res.render("searchstudent.ejs", { id, result });
  });
});

//post leave application
app.post("/op", (req, res) => {
  let data = req.body;
  let name = data.employee_name;
  let reason = data.reason;
  let startdate = data.start_date;
  let enddate = data.end_date;
  let employee_id = data.employee_id;
  let id = uuidv4();
  let q = `INSERT INTO leavetable (name ,reason ,startDate, endDate,employee_id) VALUES ( "${name}", "${reason}", "${startdate}" ,"${enddate}" ,${employee_id})`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while adding data.");
    } else {
      // After successful insertion, retrieve the request_id
      connection.query("SELECT LAST_INSERT_ID() as request_id", (err, rows) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error occurred while retrieving request_id.");
        } else {
          const request_id = rows[0].request_id;
          // Now you have the request_id, and you can use it as needed
          res.send(
            `Leave Application submitted check your status with request_id: ${request_id}`
          );
        }
      });
    }
  });
});

app.post("/form/submit/admin", (req, res) => {
  let { userID, name } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO admin_data (userID ,name) VALUES ( "${userID}", "${name}")`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while adding data.");
    } else {
      res.send("Data added successfully.");
    }
  });
});

// hr page leave actions
app.get("/leave/action", (req, res) => {
  let q = `SELECT reason,startDate,endDate,request_id,employee_id FROM leavetable WHERE status="pending" `;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    } else {
      console.log(result);
      let data = result;
      res.render("leaverequest.ejs", { data });
    }
  });
});
app.post("/leaveappl/rqst", (req, res) => {
  const { employee_id, status, request_id } = req.body;
  const query = "UPDATE leavetable SET status = ? WHERE request_id = ?";
  connection.query(query, [status, request_id], (err, results) => {
    if (err) {
      console.error("Error accepting request: " + err);
      res.status(500).json({ error: "Error accepting request " });
    } else {
      res.json({ message: "Leave Accepted successfully" });
    }
  });
});
app.post("/leave/status", (req, res) => {
  let { reqstID } = req.body;
  let q = `SELECT status FROM leavetable WHERE request_id=${reqstID} `;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    } else {
      console.log(result[0].status);
      let data = result;
      res.send(`your application is ${result[0].status}`);
    }
  });
});

//chnage attendence of employee by HR and by Admin
app.post("/changeAttendance", (req, res) => {
  const { employee_id, status, date } = req.body;
  const loginTime = new Date().toLocaleTimeString();

  // Check if the 'date' is a valid string representing a date (e.g., '2023-11-01')
  const dateObject = new Date(date);
  if (isNaN(dateObject.getTime())) {
    // If the date is not valid, you can handle the error or return an error response.
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  const attendance_date = dateObject.toISOString().split("T")[0];

  // Step 1: Check if an attendance record exists for the employee and date
  const selectQuery =
    "SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?";

  connection.query(
    selectQuery,
    [employee_id, attendance_date],
    (err, results) => {
      if (err) {
        console.error("Error checking attendance: " + err);
        res.status(500).json({ error: "Error checking attendance" });
      } else {
        if (results.length > 0) {
          // Step 2: Update the status of the existing attendance record
          const updateQuery =
            "UPDATE attendance SET status = ?, in_time = ? WHERE employee_id = ? AND attendance_date = ?";

          connection.query(
            updateQuery,
            [status, loginTime, employee_id, attendance_date],
            (err, updateResult) => {
              if (err) {
                console.error("Error updating attendance: " + err);
                res.status(500).json({ error: "Error updating attendance" });
              } else {
                res.json({ message: "Attendance updated successfully" });
              }
            }
          );
        } else {
          // Step 3: Insert a new attendance record
          const insertQuery =
            "INSERT INTO attendance (employee_id, attendance_date, status, in_time) VALUES (?, ?, ?, ?)";

          connection.query(
            insertQuery,
            [employee_id, attendance_date, status, loginTime],
            (err, insertResult) => {
              if (err) {
                console.error("Error marking attendance: " + err);
                res.status(500).json({ error: "Error marking attendance" });
              } else {
                res.json({ message: "Attendance marked successfully" });
              }
            }
          );
        }
      }
    }
  );
});


//add student
app.get("/home/form/student", (req, res) => {
  res.render("studentform.ejs");
});

app.post("/form/submit/student", (req, res) => {
  let { name,  studentID ,mobile,email,courses,date } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO student_data (name ,student_id,course,phone_no,email,joining_date) VALUES ( "${name}", ${studentID},"${courses}",${mobile},"${email}" , "${date}")`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while adding data.");
    } else {
      res.send("Data added successfully.");
    }
  });
});