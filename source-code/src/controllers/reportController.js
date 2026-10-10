
const pool = require("../config/db");

// 1. Employee count for each department
exports.getDepartmentCounts = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        COUNT(e.id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      GROUP BY d.id, d.name
      ORDER BY d.name ASC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Department counts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department counts",
    });
  }
};

// 2. Average salary
exports.getAverageSalary = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS employee_count,
        ROUND(AVG(salary), 2) AS average_salary
      FROM employees
    `);

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Average salary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate average salary",
    });
  }
};

// 3. Highest-paid employee
exports.getHighestPaidEmployee = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        e.id,
        e.first_name,
        e.last_name,
        e.email,
        e.salary,
        e.status,
        d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.salary = (
        SELECT MAX(salary) FROM employees
      )
      ORDER BY e.id ASC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Highest-paid employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve highest-paid employee",
    });
  }
};

// 4. Active and inactive employee counts
exports.getEmployeeStatusCounts = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_employees,
        COALESCE(SUM(status = 'active'), 0) AS active_employees,
        COALESCE(SUM(status = 'inactive'), 0) AS inactive_employees
      FROM employees
    `);

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Employee status counts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employee status counts",
    });
  }
};

// 5. Employees earning above a specified salary
exports.getEmployeesAboveSalary = async (req, res) => {
  try {
    const salary = req.query.minSalary;

    if (
      salary === undefined ||
      salary.trim() === "" ||
      !Number.isFinite(Number(salary)) ||
      Number(salary) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid non-negative minSalary query parameter",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
         e.id,
         e.first_name,
         e.last_name,
         e.email,
         e.salary,
         e.status,
         d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.salary > ?
       ORDER BY e.salary DESC, e.id ASC`,
      [Number(salary)]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Salary threshold report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employees by salary",
    });
  }
};