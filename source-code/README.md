# Employee & Department Management API

This project is a REST API for managing employees and departments. It is built using Node.js, Express and MySQL.

Users can register and log in, manage departments and employees, and view reports related to employee salaries and department details.

Technologies Used 

Node.js and Express.js
MySQL
JWT for authentication
bcrypt for password hashing
Postman for API testing

 Getting Started

1. Install dependencies

Open the project folder in your terminal and run:
bash
npm install

2. Set up the database

Create a MySQL database named employee_management and import the provided database.sql file. It contains the tables and sample data needed to run the project.

3. Configure environment variables

Create a .env file in the project root and add your MySQL and JWT settings.

dotenv

PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_management
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

Replace the example values with your own configuration.

4. Start the server

bash
npm run dev


The API will run at `http://localhost:3000`.

API Endpoints

Authentication

| Method | Endpoint             | Purpose                          |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/auth/register` | Register a new user              |
| POST   | `/api/auth/login`    | Log in and get a token           |
| GET    | `/api/auth/profile`  | Get the logged-in user's profile |

Departments

| Method | Endpoint               | Purpose                |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/departments`     | Get all departments    |
| GET    | `/api/departments/:id` | Get a department by ID |
| POST   | `/api/departments`     | Add a department       |
| PUT    | `/api/departments/:id` | Update a department    |
| DELETE | `/api/departments/:id` | Delete a department    |

Employees

| Method | Endpoint             | Purpose               |
| ------ | -------------------- | --------------------- |
| GET    | `/api/employees`     | Get employees         |
| GET    | `/api/employees/:id` | Get an employee by ID |
| POST   | `/api/employees`     | Add an employee       |
| PUT    | `/api/employees/:id` | Update an employee    |
| DELETE | `/api/employees/:id` | Delete an employee    |

The employee listing endpoint also supports searching, filtering, pagination and sorting.

Reports

| Method | Endpoint                                    | Purpose                                 |
| ------ | ------------------------------------------- | --------------------------------------- |
| GET    | `/api/reports/department-counts`            | Employee count in each department       |
| GET    | `/api/reports/average-salary`               | Average employee salary                 |
| GET    | `/api/reports/highest-paid`                 | Highest-paid employee details           |
| GET    | `/api/reports/employee-status-counts`       | Employee counts by status               |
| GET    | `/api/reports/above-salary?minSalary=50000` | Employees earning above a salary amount |

Authentication

After logging in, copy the token returned by the API. In Postman, open the Authorization tab, select Bearer Token, and paste the token to access protected endpoints.

Testing

I used Postman to test the API endpoints, including authentication, department and employee operations, and reports.

The project also uses parameterized SQL queries and bcrypt password hashing. A department cannot be deleted while employees are still assigned to it.

Project Files

* `src/` — API routes, controllers, middleware and database configuration
* `.env.example` — Example environment configuration
* `database.sql` — Database tables and sample data
* `README.md` — Project setup and API documentation

Note:Keep your actual `.env` file private and do not include database passwords or JWT secrets in the submission.
