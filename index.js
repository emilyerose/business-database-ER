const inquirer = require('inquirer')
const promptQs = require('./assets/inquirerQs.js')
const mysql = require('mysql2');

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

