USE employee_db;

INSERT INTO departments (name)
VALUES ("Operation");
INSERT INTO departments (name)
VALUES ("Finance");
INSERT INTO departments (name)
VALUES ("Service");
INSERT INTO departments (name)
VALUES ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUES ("Portfolio Manager", 100000, 2);
INSERT INTO roles (title, salary, department_id)
VALUES ("Consultant", 80000, 2);
INSERT INTO roles (title, salary, department_id)
VALUES ("Accountant", 90000, 3);
INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Rep", 950000, 1);
INSERT INTO roles (title, salary, department_id)
VALUES ("Lead Processor", 200000, 4);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Kristina", "Rivera", 1, 3);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Denzel", "Vasquez", 2, 1);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Nancy", "Washington", 3, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Joshua", "Cabrera", 4, 3);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Carl", "Johnson", 5, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Raul", "Mariduena", 2, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Maribel", "Gonzales", 4, 7);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Kevin", "Hernandez", 1, 2);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Bryan", "Thompson", 3, 1);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Jorge", "Iguina", 2, 1);