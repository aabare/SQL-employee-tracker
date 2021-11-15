const mysql = require('mysql2')
const inquirer = require('inquirer');
const cTable = require('console_table');

require('dotenv').config()

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'tracker_db'
});

connection.connect(err => {
    if (err) throw err;
    console.log('connected as id' + connection.threadId);
    afterConnection();
});

afterConnection = () => {
    console.log("=============================")
    console.log("=                           =")
    console.log("=     EMPLOYEE MANAGER      =")
    console.log("=                           =")
    console.log("=============================")
    promptUser();
};

const promptUser = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: ['View All Employees',
                      'View All Employees by Department',
                      'View All Employees by Manager',
                      'View All Departments',
                      'Add a Department',
                      'Add Employee',
                      'Remove Employee',
                      'Update Employee Role',
                      'Update Employee Manager',
                      'View All Roles',
                      'Add Role',
                      'Remove Role']
        }

    ])
    .then((answers) => {
        const { choices } = answers;

        if (choices === "View All Employees") {
            showEmployees();
        }

        if (choices === "View All Employees by Department") {
            employeeDepartment();
        }

        if (choices === "View All Departments") {
            showDepartments();
        }

        if (choices === "Add a Department") {
            addDepartment();
        }

        if (choices === "Add Employee") {
            addEmployee();
        }

        if (choices === "Remove Employee") {
            deleteEmployee();
        }

        if (choices === "Update Employee Role") {
            updateEmployee();
        }

        if (choices === "Update Employee Manager") {
            updateManager();
        }

        if (choices === "View All Roles") {
            showRoles();
        }

        if (choices === "Add Role") {
            addRole();
        }

        if (choices === "Remove Role") {
            deleteRole();
        };
    });
};

showDepartments = () => {
    console.log('Showing all departments...');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

    connection.promise().query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        promptUser();
    });
};

showRoles = () => {
    console.log('Showing all roles...');

    const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;

    connection.promise().query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        promptUser();
    });
};

showEmployees = () => {
    console.log('Showing all employess...');
    const sql = `SELECT employee.id,
                        employee.first_name,
                        employee.last_name,
                        role.title,
                        department.name AS department,
                        role.salary,
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                    FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
                                               
    connection.promise().query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        promptUser();
    });
};

addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDept',
            message: "What department would you like to add?",
            validate: addDept => {
                if (addDept) {
                    return true;
                } else {
                    console.log('Please enter a department');
                    return false;
                }
            }
        }
    ])
    .then(answer => {
        const sql = `INSERT INTO department (name)
                     VALUES (?)`;
        connection.query(sql, answer.addDept, (err, result) => {
            if (err) throw err;
            console.log('Added ' + answer.addDept + " to departments.");

            showDepartments();
        });
    });
};

addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "What role would you like to add?",
            validate: addRole => {
                if (addRole) {
                    return true;
                } else {
                    console.log('Please add a role');
                    return false;
                }
            }
        }
    ])
    .then(answer => {
        const params = [answer.role, answer.salary];

        const roleSql = `SELECT name, id FROM department`;

        connection.promise().query(roleSql, (err, data) => {
            if (err) throw err;

            const dept =  data.map(({ name, id }) => ({ name: name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: "What department is this role in?",
                    choices: dept
                }
            ])
            .then(deptChoice => {
                const dept = deptChoice.dept;
                params.push(dept);

                const sql = `INSERT INTO role (title, salary, department_id)
                             VALUES (?, ?, ?)`;
                        
                connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log('Addedd' + answer.role + " to roles.");

                    showRoles();
                });
            });
        });
    });
};

addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'fistName',
        message: "What is the employee's first name?",
        validate: addFirst => {
          if (addFirst) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: addLast => {
          if (addLast) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
      const params = [answer.fistName, answer.lastName]
  
      const roleSql = `SELECT role.id, role.title FROM role`;
    
      connection.promise().query(roleSql, (err, data) => {
        if (err) throw err; 
        
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
  
        inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role);
  
                const managerSql = `SELECT * FROM employee`;
  
                connection.promise().query(managerSql, (err, data) => {
                  if (err) throw err;
  
                  const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      params.push(manager);
  
                      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;
  
                      connection.query(sql, params, (err, result) => {
                      if (err) throw err;
                      console.log("Employee has been added!")
  
                      showEmployees();
                });
              });
            });
          });
       });
    });
  };
  

updateEmployee = () => {
    const employeeSql = `SELECT * FROM employee`;
  
    connection.promise().query(employeeSql, (err, data) => {
      if (err) throw err; 
  
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ])
        .then(employeeChoice => {
          const employee = employeeChoice.name;
          const params = []; 
          params.push(employee);
  
          const roleSql = `SELECT * FROM role`;
  
          connection.promise().query(roleSql, (err, data) => {
            if (err) throw err; 
  
            const roles = data.map(({ id, title }) => ({ name: title, value: id }));
            
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'role',
                  message: "What is the employee's new role?",
                  choices: roles
                }
              ])
                  .then(roleChoice => {
                  const role = roleChoice.role;
                  params.push(role); 
                  
                  let employee = params[0]
                  params[0] = role
                  params[1] = employee 
    
                  const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
  
                  connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                  console.log("Employee has been updated!");
                
                  showEmployees();
            });
          });
        });
      });
    });
  };
  
  updateManager = () => {
    const employeeSql = `SELECT * FROM employee`;
  
    connection.promise().query(employeeSql, (err, data) => {
      if (err) throw err; 
  
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ])
        .then(employeeChoice => {
          const employee = employeeChoice.name;
          const params = []; 
          params.push(employee);
  
          const managerSql = `SELECT * FROM employee`;
  
            connection.promise().query(managerSql, (err, data) => {
              if (err) throw err; 
  
            const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
              
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      params.push(manager); 
                      
                      let employee = params[0]
                      params[0] = manager
                      params[1] = employee 
            
                      const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
  
                      connection.query(sql, params, (err, result) => {
                        if (err) throw err;
                      console.log("Employee has been updated!");
                    
                      showEmployees();
            });
          });
        });
      });
    });
  };

employeeDepartment = () => {
    console.log('Showing employee by departments...');
    const sql = `SELECT employee.first_name, 
                        employee.last_name, 
                        department.name AS department
                 FROM employee 
                 LEFT JOIN role ON employee.role_id = role.id 
                 LEFT JOIN department ON role.department_id = department.id`;
  
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err; 
      console.table(rows); 
      promptUser();
    });          
  };
  
deleteRole = () => {
    const roleSql = `SELECT * FROM role`; 
  
    connection.promise().query(roleSql, (err, data) => {
      if (err) throw err; 
  
      const role = data.map(({ title, id }) => ({ name: title, value: id }));
  
      inquirer.prompt([
        {
          type: 'list', 
          name: 'role',
          message: "What role do you want to delete?",
          choices: role
        }
      ])
        .then(roleChoice => {
          const role = roleChoice.role;
          const sql = `DELETE FROM role WHERE id = ?`;
  
          connection.query(sql, role, (err, result) => {
            if (err) throw err;
            console.log("Successfully deleted!"); 
  
            showRoles();
        });
      });
    });
  };

deleteEmployee = () => {
    const employeeSql = `SELECT * FROM employee`;
  
    connection.promise().query(employeeSql, (err, data) => {
      if (err) throw err; 
  
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: "Which employee would you like to delete?",
          choices: employees
        }
      ])
        .then(empChoice => {
          const employee = empChoice.name;
  
          const sql = `DELETE FROM employee WHERE id = ?`;
  
          connection.query(sql, employee, (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!");
          
            showEmployees();
      });
    });
   });
  }; 