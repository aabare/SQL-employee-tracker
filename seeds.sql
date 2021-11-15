INSERT INTO department (name)
VALUES
('Sales'),
('Engineering'),
('Finance'),
('Legal');

INSERT INTO role (title, salary, department_id)
VALUES
('Sales Lead', 100000, 1),
('Salesperson', 80000, 1),
('Lead Engineer', 150000, 2),
('Software Engineer', 120000, 2),
('Accountant', 125000, 3),
('Legal Team Lead', 250000, 4),
('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('William', 'Henry', 2, null),
('Mackenzie', 'Jefferson', 1, 1),
('Grace', 'Lincoln', 4, null),
('Theodore', 'Johnson', 3, 3),
('Annabelle', 'Reed', 6, null),
('Elenor', 'Jones', 5, 5),
('Harry', 'Washington', 7, null),
('Ronald', 'Ford', 8, 7);