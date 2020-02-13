const mysql = require("mysql");
const inquirer = require("inquirer");
let roles;
var connection = mysql.createConnection({
    host: "localhost",
    
    port: 3306,
    //  username
    user: "root",
    //  password
    password: "",
    database: "employees"
});
connection.connect(function (err) {
  if (err) throw err;
});

const manageSelections = () => {
  inquirer.prompt([{
          name: "employeeManagement",
          message: "What would you like to do?",
          type: "list",
          choices: [
              "Add Department",
              "Add Employee Role",
              "Add Employee",
              "View Departments",
              "View Employee Roles",
              "View Current Employees",
              "Update Employee Role",
              "Delete Employee",
              "Exit"
          ]
      }]).then(({employeeManagement}) => {
      switch (employeeManagement) {
          case "Add Department":
              addDepartment();
              break;
          case "Add Employee Role":
              addRole();
              break;
          case "Add Employee": 
              addEmployee();
              break;
          case "View Departments": 
              viewDepartments();
              break;
          case "View Employee Roles": 
              viewRoles();
              break;
          case "View Current Employees": 
              viewEmployees();
              break;
          case "Update Employee Role":
              updateRole();
              break;
              case "Exit": 
                connection.end();
                break;
              }
            });
          };
       // Add Employee
          const addEmployee = () => {
    
            let id;
            //Build an array of Current Titles and Title ID's 
            var query = "SELECT role_id, role_title FROM role";
            
            connection.query(query, function (err, res) {
                roles = res;
                //Create array of roles for user to pick from
                let roleCall = [];
                //Build object array of role titles for user to select from
                for (i = 0; i < roles.length; i++) {
                    roleCall.push(Object.values(roles[i].role_title).join(""));
                };//End for loop
                
                inquirer.prompt([
                {
                    message: "What is the employee's first name?",
                    name: "first_name",
                    type: "input"
                },
                {
                    message: "What is the employee's last name?",
                    name: "last_name",
                    type: "input"
                },
                {
                    message: "What is the employee's role?",
                    name: "role_title",
                    //Use roleCall array to provide role choices
                    choices: roleCall, 
                    type: "list"
                }
                ]).then((res) => {
            
            for (i = 0; i < roles.length; i++) {
                if (roles[i].role_title === res.role_title) {
                    console.log(typeof(roles[i].role_id));
                    id = roles[i].role_id;
                };
            };
            var query = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)";
            connection.query(query, [res.first_name, res.last_name, id], function (err) {
                if (err) throw err;
                // Call primary menu.
                manageSelections();
              });
            });
          });
        };

         // Adding a department
const addDepartment = () => {
  inquirer.prompt(
      {
          name: 'department', 
          type: 'input', 
          message: 'What department would you like to add?'
  }).then(function (res) {
          const query = "INSERT INTO department (department_name) VALUES (?)";
          connection.query(query, [res.department], function(err,res){
          if (err) throw err;
          console.log("Department was successfully updated. \n");
          manageSelections();
      });
  });
}; 

function addRole() {
  //Build an array of role choices
  let array = [];
  var query = "SELECT department_id as value, department_name as name FROM department";
  connection.query(query, function (err, res) {
      if (err) throw err;
      array = JSON.parse(JSON.stringify(res)); 
      var questions = [
          {
            type: "input",
            name: "title",
            message: "What is the name of the new role?"
          },
          {
            type: "input",
            name: "salary",
            message: "What is the salary of this new role?",
            validate: validateSalary
          },
          {
            type: 'list',
            name: 'department',
            message: 'Which department is the new role belongs?',
            choices: array
          }];
      
      inquirer.prompt(questions).then(res => {
          const query = "INSERT INTO role (role_title, role_salary, department_id) VALUES (?, ?, ?)";
          connection.query(query, [res.title, res.salary, res.department], function (err, res) {
              if (err) throw err;
              console.log("The role has been added.");
              manageSelections();
          });
        });
      });
    }
    
const validateSalary = (salary) => {
  var salaryEntered = /^\d+$/;
  return salaryEntered.test(salary) || "Salary should be a number!";
}

const viewDepartments = () =>{
  var query = "SELECT * FROM department";
  connection.query(query, function (err, res) {
      if (err) 
          throw err;
      console.table(res);
      manageSelections();
  });
};

const viewRoles = () => {
  var query = "SELECT * FROM role";
  connection.query(query, function (err, res) {
      if (err) 
          throw err;
      console.table(res);
      manageSelections();
  });
};

const viewEmployees = () => {
  var query = "SELECT * FROM employee";
  connection.query(query, function (err, res) {
      if (err) 
          throw err;
      console.table(res);
      manageSelections();
  });
};

const updateRole = () => {
  let roles;
  let employee;
  let roleCall = [];
  var query = "SELECT employee_id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS employees FROM employee";
  console.log(roles)
  connection.query(query, function (err, res) {
      if (err) 
          throw err;
          console.log(res)
      employee = res;
      //Build an array of Current Titles and Title ID's 
      var query_two = "SELECT role_id, role_title FROM role";
      connection.query(query_two, function (err, res) {
          if (err) throw err;
          roles = res;
          console.log(roles)
          console.log(roles.length);
          //Create array of roles for user to pick from
          
          //Build object array of role titles for user to select from
          for (i = 0; i < roles.length; i++) {
              roleCall.push(Object.values(roles[i].role_title).join(""));
          };//End for loop
          console.log(roleCall)
  
  console.log(employee)
  let currentEmployees = [];
  
  
  //Build list of employees for user to select from
  for (i = 0; i < employee.length; i++) {
    currentEmployees.push(Object.values(employee[i].employees).join(""));
  };
  //Build list of roles for user to select from
  for (i = 0; i < roles.length; i++) {
    roleCall.push(Object.values(roles[i].role_title).join(""));
  };
  //Prompt user for which employee and role need to be updated
  inquirer.prompt([
    {
      message: "Which employee's role do you want to update?",
      name: "employee",
      type: "list",
      choices: currentEmployees
    },
    {
      message: "What is the employee's role?",
      name: "title",
      type: "list",
      choices: roleCall
    }
  ]).then((res) => {

    let employee_id;
    let role_id;
    //Find role id based off of role name
    for (i = 0; i < roles.length; i++) {
      if (roles[i].role_title === res.title) {
        role_id = roles[i].role_id;
      };
    };
    //Find employee id based of of employee name
    for (i = 0; i < employee.length; i++) {
      if (employee[i].employees === res.employee) {
        employee_id = employee[i].employee_id;
      };
    };
    var query = ("UPDATE employee SET role_id = ? WHERE employee_id = ?");
    connection.query(query, [role_id, employee_id], function (err, res) {
      if (err) throw err;
      
      });
    });
  });
 });
};
manageSelections();