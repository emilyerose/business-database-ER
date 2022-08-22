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
            case 'View Department Budgets':
                seeDeptBudget();
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

function seeEmployees() {
    //this doesn't get the manager name (if it exists) because hurgleblurgle
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, department.dept_name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM
    employee LEFT JOIN roles ON employee.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`, (err, result) => {
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
        if (result[0].length===0){
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
     
async function addEmployee() {
    try {
        const {firstname,lastname,role,manager} = await inquirer.prompt(promptQs.employeePrompt);
        let idquery = await db.promise().query(`SELECT id FROM roles WHERE title = ?`, role)
        if (idquery[0].length===0){
            throw Error('There is no role matching this name in the database. Please add this role before referencing it with an employee.')
        }
        idquery = idquery[0][0].id
        let managerQuery;
        let managerName;
        //if no manager is entered, the person will have default 'null' manager, but if a manager is entered, get the ID
        if (manager){
            managerName = manager.split(" ")
            //if only one name was given, ask for two
            if (managerName.length<2) throw Error('Please enter a first and last name for the manager.')
            managerQuery =  await db.promise().query(`SELECT id FROM employee WHERE first_name = ? AND last_name = ?`, managerName)
            //if no matching manager is found, throw an error
            if (managerQuery[0].length===0){
                throw Error('There is no manager matching this name in the database. Please add this manager as an employee before referencing them.')
            }
            managerQuery = managerQuery[0][0].id
        }
        else managerQuery = null;
        db.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?)`,[[firstname,lastname,idquery,managerQuery]], (err, result) => {
            if (err) {
                console.error(err)
            }
            else {
                console.log(`Added ${firstname} ${lastname} to employee table.`)
            }
            loadMainMenu();
    })
}
    catch {err => {
        console.error(err)
        loadMainMenu();
    }}

}

function seeDeptBudget() {
    db.query(`SELECT department.dept_name AS department, SUM(salary) AS budget FROM
    (employee LEFT JOIN roles ON employee.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id) GROUP BY department.id;`, (err,result) => {
        err ? console.error(err) : console.table(result)
    })
    loadMainMenu();
}

async function updateRole() {
    //need to promisify this too
    //get all employees (arr of objects)
    let employees;
    try {
        employees = await db.promise().query(`SELECT * FROM employee`);
        if (employees[0].length === 0) {
            throw Error('There are no employees in the database to update.');
        }
    }
    catch(err) {
        console.error(err)
        //HOW DO I EXIT HELP
        return}

    let employeeList=[];
    //push each employee's first and last name as a string to employeeList
    employees[0].forEach(entry => employeeList.push(`${entry.first_name} ${entry.last_name}`))
    const updateEmpQs = promptQs.updateEmployeeRolePrompt(employeeList);
    const response = await inquirer.prompt(updateEmpQs)
        //if anyone has two word first or last names this gets messed up but i don't see any other way to do it given the constraints
    const [firstname,lastname] = response.employeename.split(" ")
    let idquery = await db.promise().query(`SELECT id FROM roles WHERE title = ?`, response.role)
    if (idquery[0].length===0){
        throw Error('There is no role matching this name in the database. Please add this role before referencing it with an employee.')
    }
    idquery = idquery[0][0].id
    await db.promise().query(`UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`, [idquery,firstname,lastname])
    console.log (`Updated ${response.employeename}'s role.`)
    loadMainMenu();
}

loadMainMenu()