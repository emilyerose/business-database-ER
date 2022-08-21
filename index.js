const inquirer = require('inquirer')
const promptQs = require('./assets/inquirerQs.js')
const mysql = require('mysql2');
const ctable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        database: 'business_db'
    },
    console.log('Connected to the business_db database.')
)

//create database

//populate database

function loadMainMenu() {
    inquirer.prompt(promptQs.menuPrompt)
    .then(response => {
        switch (response.mainmenu) {
            case 'View All Departments':
                seeDepts();
                break;
            case 'View All Roles':
                seeRoles();
                break;
            case 'View All Employees':
                seeEmployees();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
        }
    })
}

function seeDepts() {
    db.promise().query(`SELECT dept_name AS Department, id FROM department`)
    .then(results => {
        console.table(results[0]);
        loadMainMenu()
    })
    .catch(err => console.error(err))
}

function seeRoles() {
    db.query(`SELECT roles.title AS role, roles.id, roles.salary, department.dept_name AS department FROM 
    roles LEFT JOIN department ON roles.department_id = department.id`, (err, result) => {
        err ? console.error(err) : console.table(result)
        loadMainMenu();
    })
}

function addDept() {
    inquirer.prompt(promptQs.deptPrompt)
    .then(response => {
        db.query(`INSERT INTO department (dept_name) VALUES (?)`, [response.department], (err,result) => {
            err ? console.error(err) : console.log(`Added ${response.department} to department table.`)
        })
        loadMainMenu()
    })
}

async function addRole() {
    //need to promisify this nonsense
    const deptsql = `SELECT id FROM department WHERE dept_name = ?`;
    const {role,salary,department} = await inquirer.prompt(promptQs.rolePrompt)
    db.promise().query(deptsql, department) 
    .then(result => {
        if (!result[0]){
            throw Error('There is no department matching this name in the database. Please add this department before referencing it with a role.')
        }
        //note that result[0] console logs to [ { id: 3 } ] 
        return result[0][0].id
    })
    .then(deptid => {
        db.query(`INSERT INTO roles (title,salary,department_id) VALUES (?)`,[[role,salary,deptid]], (err, result) => {
            if (err) {
                console.error(err)
            }
            else {
                console.log(`Added ${role} to roles table.`)
            }
            loadMainMenu();
        })
    })
    .catch(err => {
        console.error(err)
        loadMainMenu();
    })
}
        

async function updateRole() {
    //need to promisify this too
    //get all employees (arr of objects)
    const employees = await db.query(`SELECT * FROM employee`);
    if (!employees) {
        console.log('There are no employees in the database to update.');
        loadMainMenu();
        return;
    }
    let employeeList;
    //push each employee's first and last name as a string to employeeList
    employees.forEach(entry => employeeList.push(`${entry.first_name} ${entry.last_name}`))
    inquirer.prompt(promptQs.updateEmployeeRolePrompt(employeeList))
    .then(response => {
        //if anyone has two word first or last names this gets messed up but i don't see any other way to do it given the constraints
        const [firstname,lastname] = response.employeename.split(" ")
        db.query(`UPDATE employee SET role = ? WHERE first_name = ? AND last_name = ?`, [response.role,firstname,lastname], (err, result) =>{
            err ? console.error(err) : console.log (`Updated ${response.employeename}'s role.`)
        })
        loadMainMenu();
    })
}

loadMainMenu()