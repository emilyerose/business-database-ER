/*get depts*/
SELECT * FROM department;

/*get Roles 
is there a way to not get the id fields with the join? or do i just need to list all the column names in the select*/
SELECT * FROM roles
JOIN department ON roles.department_id = department.id;

/*get employees
... what is going on here how do i join all the tables and also loop back to my own table*/
SELECT * FROM employees
JOIN roles ON employees.role_id = roles.id;

/*add Department*/
INSERT INTO department 
VALUES ()