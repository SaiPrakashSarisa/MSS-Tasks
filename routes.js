const fs = require("fs");
const url = require("url");
// file to save data
const studentsFile = "Students.txt";

const requestHandler = (req, res) => {
  // parsing the URL
  const myUrl = url.parse(req.url, true);
  console.log("running");
  /* <<<<<<<<<<<<<<<<<<<<<<<<< <<<<<<<<<<<<<<   To generate users registration form   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  */
  if (myUrl.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });

    //writing html form to the page
    res.write(`
          <html>
            <body>
              <button type="button" onclick="window.location.href='/users-list'">Students List</button>
              <h1>Register Student</h1>
              <form  action="/register">
                <label for="fname">First Name:</label>
                <input type="text" name="fname" ><br><br>
                <label for="lname">Last Name:</label>
                <input type="text" name="lname"><br><br>
                <label for="email">Email:</label>
                <input type="email" name="email" pattern="/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/"><br><br>
                <label for="phone">Mobile Number:</label>
                <input type="text" name="phone"><br><br>
                <button type="submit">Register</button>
              </form>
            </body>
          </html>
        `);
    res.end();
  } else if (myUrl.pathname === "/register") {
    /* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  To save user data in the file and redirect to users list page  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  */
    // performing validations
    let fName = myUrl.query.fname;
    let lName = myUrl.query.lname;
    let email = myUrl.query.email;
    let phone = myUrl.query.phone;

    // creating student object
    const student = {
      firstName: fName,
      lastName: lName,
      email: email,
      phone: phone,
    };

    // getting existing users data if data is available or creating an empty array
    const getStudents = () => {
      try {
        // tyring to access data form the given file name
        // if the file is not avilable it will create a new file.
        const data = fs.readFileSync(studentsFile);
        return data.length === 0 ? [] : JSON.parse(data);
      } catch (err) {
        return [];
      }
    };

    // The data we got from getUsers method is sotred in users array.
    const students = getStudents();
    // pushing user object into the users array.
    students.push(student);

    // updating the file using write file method
    fs.writeFile(studentsFile, JSON.stringify(students), (err) => {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        res.end("Server Error");
      } else {
        // res.statusCode = 200;
        res.writeHead(302, { Location: "/users-list" });
        /*res.end(
              `${student.firstName} ${student.lastName} has been added sucessfully`
            );*/
        res.end();
      }
    });
    /* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<    To view all users data    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  */
  } else if (req.url === `/users-list`) {
    // reading data from Students.txt file
    const studentsData = fs.readFileSync(studentsFile);
    const students = JSON.parse(studentsData);

    // this block is to display data to user
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(`
        <html>
            <body><button type="button" onclick="window.location.href='/'">Add Student</button>
            <h1>Students List</h1>
              <form action = "/delete-selected">
                <table>
                    <thead>
                        <tr>
                        <th> </th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                <tbody>
        `);
    // loop for inserting user data in each record
    for (let i = 0; i < students.length; i++) {
      let student = students[i];
      res.write(`
            <tr>
            <td><input type="checkbox"  value="${i}" name="deleted"></td>
            <td>${student.firstName}</td>
            <td>${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td><td><button type="button" onclick="window.location.href='/edit?index=${i}'">Edit</button>
                <button type="button" onclick ="window.location.href='/delete?index=${i}'">Delete</button>
            </td>
            `);
    }
    res.write(`
                </tbody>
            </table>
            <br>
            <input type="submit" value="Delete Selected">
            </form>
            </body>
        </html>
        `);
    res.end();
  } else if (myUrl.pathname === "/delete-selected") {
    // getting url query
    const paramquery = url.parse(req.url, true).query;
    //console.log(paramquery);
    // getting the array of index values of records to be deleted
    let delrows = [...paramquery.deleted];
    console.log(delrows);
    // reading data from Students.txt file
    const studentsData = fs.readFileSync(studentsFile);
    // parsing data to java script objects
    const students = JSON.parse(studentsData);
    //console.log("available students");
    // console.log(students);
    // converting array of strings to array of numbers
    delrows = delrows.map((item) => +item);
    // filtering array
    const newStudents = students.filter(
      (item, index) => !delrows.includes(index)
    );
    //console.log(newStudents);
    // updating the students file
    fs.writeFile(studentsFile, JSON.stringify(newStudents), (err) => {
      if (err) throw err;
      else {
        res.writeHead(302, { Location: "/users-list" });
        res.end();
      }
    });
  } else if (myUrl.pathname === "/delete") {
    /* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<    To Delete Data    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  */
    // Getting index value form the url
    let index = myUrl.query.index;
    // getting data form the file
    const studentsData = fs.readFileSync(studentsFile);
    // parsing the studnet data
    const students = JSON.parse(studentsData);
    // removing student object form the students array
    students.splice(index, 1);
    // updating the students file
    fs.writeFile(studentsFile, JSON.stringify(students), (err) => {
      if (err) throw err;
      else {
        res.writeHead(302, { Location: "/users-list" });
        res.end();
      }
    });
    /* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<    To Edit user Data    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  */
  } else if (myUrl.pathname === "/edit") {
    // Getting index value form the url
    let index = myUrl.query.index;
    // getting data form the file
    const studentsData = fs.readFileSync(studentsFile);
    // parsing the studnet data
    const students = JSON.parse(studentsData);
    const student = students[index];
    // form for updating details
    res.write(`
        <html>
          <body>
            <h1>Register Student</h1>
            <form  action="/update">
              <input type="hidden" value='${index}' name ="id">
              <label for="fname">First Name:</label>
              <input type="text" name="fname" value='${student.firstName}'><br><br>
              <label for="lname">Last Name:</label>
              <input type="text" name="lname" value='${student.lastName}'><br><br>
              <label for="email">Email:</label>
              <input type="email" name="email" value='${student.email}'><br><br>
              <label for="phone">Mobile Number:</label>
              <input type="text" name="phone" value='${student.phone}'><br><br>
              <button type="submit">Update</button>
            </form>
          </body>
        </html>
      `);
    res.end();
    /* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<    updating edits to the storage and redirecting to the     >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  */
  } else if (myUrl.pathname === "/update") {
    // Getting index value form the url
    let index = myUrl.query.id;
    console.log(myUrl); // index isn't recieved

    // reading data from Students.txt file
    fs.readFile(studentsFile, (err, data) => {
      if (err) throw err;
      else {
        const students = JSON.parse(data);

        const student = students[index];

        // updating array
        student.firstName = myUrl.query.fname;
        student.lastName = myUrl.query.lname;
        student.email = myUrl.query.email;
        student.phone = myUrl.query.phone;

        // updating the file using write file method
        fs.writeFile(studentsFile, JSON.stringify(students), (err) => {
          if (err) {
            console.error(err);
            res.statusCode = 500;
            res.end("Server Error");
          } else {
            res.writeHead(302, { Location: "/users-list" });
            res.end();
          }
        });
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write(`<h2>Page Not Found</h2>`);
    res.end();
  }
};

module.exports = requestHandler;
