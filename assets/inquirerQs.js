const mainMenu = ['View All Departments', 'View All Roles', 'View All Employees', 'View Department Budgets', 'Add Department', 'Add Role', 'Add Employee','Update Employee Role']

const basicvalidator = (response) => {
    //validates non-numeric inputs
    if (!response) {
        return "Please enter something for this field."
    }
    return true
}

const salaryvalidator = (response) => {
    //validates salary
    if (!response || isNaN(parseFloat(response))) {
        return "Please enter a number for salary."
    }
    return true
}

const normalizeCaps = (response) => {
    //capitalizes the first letter of every word in response
    response = response.trim();
    response = response.toLowerCase();
    const words = response.split(' ');
    if (response) return words.map(word => word[0].toUpperCase() + word.substr(1)).join(' ')
    else return '';
}

exports.menuPrompt = [{
    type: 'list',
    name: 'mainmenu',
    message: 'What would you like to do?',
    choices: mainMenu
}]

exports.updateEmployeeRolePrompt = (employeeList) => {
    return [{
        type: 'list',
        name: 'employeename',
        message: 'Whose role would you like to update?',
        choices: employeeList
    },
    {type: 'input',
    name: 'role',
    message: 'What is the title of the new role?',
    validate: basicvalidator,
    filter: normalizeCaps}]
}

exports.employeePrompt = [
    {type: 'input',
    name: 'firstname',
    message: 'Please enter first name',
    validate: basicvalidator,
    filter: normalizeCaps},
    {type: 'input',
    name: 'lastname',
    message: 'Please enter last name',
    validate: basicvalidator,
    filter: normalizeCaps},
    {type: 'input',
    name: 'role',
    message: 'Please enter role',
    validate: basicvalidator,
    filter: normalizeCaps},
    {type: 'input',
    name: 'manager',
    message: 'Please enter manager name, if relevant',
    filter: normalizeCaps}
]

exports.deptPrompt = [{
    type: 'input',
    name: 'department',
    message: 'Please enter name of department',
    validate: basicvalidator,
    filter: normalizeCaps
}]

exports.rolePrompt = [{
    type: 'input',
    name: 'role',
    message: 'Please enter the title of the role:',
    validate: basicvalidator,
    filter: normalizeCaps
},
{
    type: 'input',
    name: 'salary',
    message: 'Please enter the role\'s corresponding salary:',
    validate: salaryvalidator,
    filter: (response) => {
        return parseFloat(response);
    }
},
{
    type: 'input',
    name: 'department',
    message: 'Please enter the department that the role corresponds to:',
    validate: basicvalidator,
    filter: normalizeCaps
},
];

