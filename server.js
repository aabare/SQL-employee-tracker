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

        if (choices === "View All Employees by Manager") {
            employeeManager();
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

showEmployees = () => {
    console.log('Showing all employees...');
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