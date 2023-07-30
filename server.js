const inquirer = require("inquirer");
const connection = require("./db/connection");
require("console.table");
const figlet = require("figlet");

// Connect to database and start app
displayEmployeeTracker();
connection.connect((err) => {
  if (err) throw err;
  firstPrompt();
});

// Displaying the "Track Employee" ASCII
function displayEmployeeTracker() {
  const font = "Slant";
  figlet.text("EmployeeTracker", { font }, (err, data) => {
    if (err) {
      console.log("Error displaying ASCII:", err);
      return;
    }
    console.log(data);
    console.log("\n");
  });
}

// Displaying the initial user prompt
function firstPrompt() {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "View Employees By Manager",
        "View Employees By Department",
        "View Combined Salaries In Department",
        "Add A Department",
        "Add A Role",
        "Add An Employee",
        "Update An Employee Role",
        "Update An Employee Manager",
        "Delete A Department",
        "Delete A Role",
        "Delete An Employee",
        "Exit",
      ],
    })
    .then(({ task }) => {
      switch (task) {
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add A Department":
          addDepartment();
          break;
        case "View Employees By Manager":
          viewEmployeesByManager();
          break;
        case "View Employees By Departments":
          viewEmployeesByDepartment();
          break;
        case "View Combined Salaries In Departments":
          viewTotalDepartmentBudget();
          break;
        case "Add A Role":
          addRole();
          break;
        case "Add An Employee":
          addAnEmployee();
          break;
        case "Update An Employee Role":
          updateAnEmployeeRole();
          break;
        case "Update An Employee Manager":
          updateAnEmployeeManager();
          break;

        case "Delete A Department":
          deleteDepartment();
          break;
        case "Exit":
          connection.end();
          console.log("Application terminated.");
          break;
      }
    });
}
//View departments
function viewAllDepartments() {
  const query = "SELECT id, name AS departments FROM departments";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    if (res.length === 0) {
      console.log("No departments found.");
    } else {
      console.table(res);
    }
    firstPrompt();
  });
}
// View roles
function viewAllRoles() {
  const query = `
    SELECT r.id AS id, r.title, d.name AS departments, r.salary 
    FROM roles AS r
    INNER JOIN departments AS d ON r.departments_id = d.id
  `;

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    if (res.length === 0) {
      console.log("No roles found.");
    } else {
      console.table(res);
    }
    firstPrompt();
  });
}
// View employees
function viewAllEmployees() {
  const query = `
    SELECT
      e.id AS id,
      e.first_name,
      e.last_name,
      r.title AS title,
      d.name AS departments,
      r.salary,
      CONCAT(m.first_name, m.last_name) AS manager
    FROM employees AS e
    INNER JOIN roles AS r ON e.roles_id = r.id
    INNER JOIN departments AS d ON r.departments_id = d.id
    LEFT JOIN employees AS m ON e.manager_id = m.id
  `;

  connection.query(query, (err, res) => {
    if (err) {
      console.error("Error retrieving employees:", err);
      return;
    }
    console.log("\n");
    if (res.length === 0) {
      console.log("No employees found.");
    } else {
      console.table(res);
    }

    firstPrompt();
  });
}

// employees by manager
function viewEmployeesByManager() {
  // get manager from the database
  const managerQuery = `
    SELECT DISTINCT CONCAT(m.first_name, ' ', m.last_name) AS manager_name, m.id AS manager_id
    FROM employees AS e
    LEFT JOIN employees AS m ON e.manager_id = m.id
    WHERE m.id IS NOT NULL
  `;
  connection.query(managerQuery, (err, managers) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "managerId",
          message: "Select a manager to view their employees:",
          choices: managers.map((manager) => ({
            name: manager.manager_name,
            value: manager.manager_id,
          })),
        },
      ])
      .then((answers) => {
        const { managerId } = answers;

        const query = `
          SELECT
            e.id AS id,
            e.first_name,
            e.last_name,
            r.title AS title,
            d.name AS departments,
            r.salary,
            CONCAT(m.first_name, ' ', m.last_name) AS manager
          FROM employees AS e
          INNER JOIN roles AS r ON e.roles_id = r.id
          INNER JOIN departments AS d ON r.departments_id = d.id
          LEFT JOIN employees AS m ON e.manager_id = m.id
          WHERE e.manager_id = ?
        `;
        connection.query(query, [managerId], (err, res) => {
          if (err) {
            console.error("Error retrieving employees:", err);
            return;
          }
          console.log("\n");
          if (res.length === 0) {
            console.log("No employees found for the selected manager.");
          } else {
            console.table(res);
          }

          firstPrompt();
        });
      });
  });
}

// employees by dep
function viewEmployeesByDepartment() {
  // dep options from db
  const departmentQuery = "SELECT id, name FROM departments";
  connection.query(departmentQuery, (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "departmentsId",
          message: "Select a department to view its employees:",
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id,
          })),
        },
      ])
      .then((answers) => {
        const { departmentId } = answers;

        const query = `
          SELECT
            e.id AS id,
            e.first_name,
            e.last_name,
            r.title AS title,
            d.name AS departments,
            r.salary,
            CONCAT(m.first_name, ' ', m.last_name) AS manager
          FROM employees AS e
          INNER JOIN roles AS r ON e.roles_id = r.id
          INNER JOIN departments AS d ON r.departments_id = d.id
          LEFT JOIN employees AS m ON e.manager_id = m.id
          WHERE d.id = ?
        `;
        connection.query(query, [departmentId], (err, res) => {
          if (err) {
            console.error("Error retrieving employees:", err);
            return;
          }
          console.log("\n");
          if (res.length === 0) {
            console.log("No employees found for the selected department.");
          } else {
            console.table(res);
          }

          firstPrompt();
        });
      });
  });
}
// dep budget
function viewTotalDepartmentBudget() {
  // get dep options from db
  const departmentQuery = "SELECT id, name FROM departments";
  connection.query(departmentQuery, (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "departmentsId",
          message: "Select a department to view the total utilized budget:",
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id,
          })),
        },
      ])
      .then((answers) => {
        const { departmentId } = answers;

        const query = `
          SELECT d.name AS departments, SUM(r.salary) AS total_budget
          FROM employee AS e
          INNER JOIN roles AS r ON e.roles_id = r.id
          INNER JOIN departments AS d ON r.departments_id = d.id
          WHERE d.id = ?
          GROUP BY d.id, d.name
        `;
        connection.query(query, [departmentId], (err, res) => {
          if (err) throw err;

          console.log("\n");
          if (res.length === 0) {
            console.log("No department found with the selected ID.");
          } else {
            console.table(res);
          }

          firstPrompt();
        });
      });
  });
}

// Add dep
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      name: "departmentsName",
      message: "What is the name of the department?",
      validate: (input) => {
        if (input.trim() === "") {
          return "Departments name cannot be empty.";
        }
        return true;
      },
    })
    .then((answers) => {
      const departmentName = answers.departmentName;

      const query = "INSERT INTO departments (name) VALUES (?)";
      connection.query(query, [departmentName], (err, res) => {
        if (err) throw err;

        console.log("\nAdded to the database");
        firstPrompt();
      });
    });
}
// Add role
function addRole() {
  // get dep from db
  const departmentQuery = "SELECT id, name FROM departments";
  connection.query(departmentQuery, (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "What is the name of the role?",
          validate: (input) => {
            if (input.trim() === "") {
              return "Role title cannot be empty.";
            }
            return true;
          },
        },
        {
          type: "input",
          name: "roleSalary",
          message: "What is the salary of the role?",
          validate: (input) => {
            if (isNaN(input)) {
              return "Salary must be a valid number.";
            }
            return true;
          },
        },
        {
          type: "list",
          name: "departmentsId",
          message: "Which department does the role belong to?",
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id,
          })),
        },
      ])
      .then((answers) => {
        const { roleTitle, roleSalary, departmentId } = answers;

        const query =
          "INSERT INTO roles (title, salary, departments_id) VALUES (?, ?, ?)";
        connection.query(
          query,
          [roleTitle, roleSalary, departmentId],
          (err, res) => {
            if (err) throw err;

            console.log("\nAdded to the database");
            firstPrompt();
          }
        );
      });
  });
}
// Add employee
function addAnEmployee() {
  // get role from db
  const roleQuery = "SELECT id, title FROM roles";
  connection.query(roleQuery, (err, roles) => {
    if (err) throw err;

    // get manager options from db
    const managerQuery =
      "SELECT id, CONCAT(first_name, ' ', last_name) AS manager FROM employees";
    connection.query(managerQuery, (err, managers) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?",
            validate: (input) => {
              if (input.trim() === "") {
                return "First name cannot be empty.";
              }
              return true;
            },
          },
          {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?",
            validate: (input) => {
              if (input.trim() === "") {
                return "Last name cannot be empty.";
              }
              return true;
            },
          },
          {
            type: "list",
            name: "rolesId",
            message: "What is the employee's role?",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            type: "list",
            name: "managerId",
            message: "Who is the employee's manager?",
            choices: [
              { name: "None", value: null },
              ...managers.map((manager) => ({
                name: manager.manager,
                value: manager.id,
              })),
            ],
          },
        ])
        .then((answers) => {
          const { firstName, lastName, rolesId, managerId } = answers;

          const query =
            "INSERT INTO employees (first_name, last_name, roles_id, manager_id) VALUES (?, ?, ?, ?)";
          connection.query(
            query,
            [firstName, lastName, roleId, managerId],
            (err, res) => {
              if (err) throw err;

              console.log("\nAdded to the database");
              firstPrompt();
            }
          );
        });
    });
  });
}
// Updating role
function updateAnEmployeeRole() {
  // get employee from db
  const employeeQuery = `
    SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS employees_name, r.title AS role
    FROM employees AS e
    INNER JOIN roles AS r ON e.roles_id = r.id
  `;
  connection.query(employeeQuery, (err, employees) => {
    if (err) throw err;

    // get roles from db
    const roleQuery = "SELECT id, title FROM roles";
    connection.query(roleQuery, (err, roles) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            type: "list",
            name: "employeesId",
            message: "Which employee's role do you want to update?",
            choices: employees.map((employee) => ({
              name: employee.employees_name,
              value: employees.id,
            })),
          },
          {
            type: "list",
            name: "rolesId",
            message: "Which role do you want to assign the selected employee?",
            choices: roles.map((Role) => ({
              name: role.title,
              value: roles.id,
            })),
          },
        ])
        .then((answers) => {
          const { employeeId, rolesId } = answers;

          const query = "UPDATE employee SET roles_id = ? WHERE id = ?";
          connection.query(query, [roleId, employeeId], (err, res) => {
            if (err) throw err;

            console.log("\nUpdated employee's role");
            firstPrompt();
          });
        });
    });
  });
}
// Update employee manager
function updateAnEmployeeManager() {
  // get employee from db
  const employeeQuery = `
    SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee AS e
    LEFT JOIN employee AS m ON e.manager_id = m.id
  `;
  connection.query(employeeQuery, (err, employees) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee's manager do you want to update?",
          choices: employees.map((employee) => ({
            name: `${employee.employee_name} (Manager: ${
              employee.manager_name || "None"
            })`,
            value: employee.id,
          })),
        },
        {
          type: "list",
          name: "managerId",
          message: "Select the new manager for the employee:",
          choices: employees.map((employee) => ({
            name: employee.employee_name,
            value: employee.id,
          })),
        },
      ])
      .then((answers) => {
        const { employeeId, managerId } = answers;

        const query = "UPDATE employee SET manager_id = ? WHERE id = ?";
        connection.query(query, [managerId, employeeId], (err, res) => {
          if (err) throw err;

          console.log("\nUpdated employee's manager");
          firstPrompt();
        });
      });
  });
}