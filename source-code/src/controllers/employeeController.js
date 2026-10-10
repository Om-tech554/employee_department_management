
const pool = require("../config/db");

// 1. Get all employees, with search, filters, pagination and sorting
exports.getAllEmployees = async (req, res) => {
  try {
    const search = String(req.query.search || "");
    const departmentId = req.query.department_id;
    const status = req.query.status;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const offset = (page - 1) * limit;

    const allowedSortColumns = {
      id: "e.id",
      first_name: "e.first_name",
      last_name: "e.last_name",
      salary: "e.salary",
      hire_date: "e.hire_date",
      created_at: "e.created_at",
    };

    const sortBy = allowedSortColumns[req.query.sortBy] || "e.id";
    const sortOrder =
      String(req.query.order || "").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";

    const conditions = [];
    const values = [];

    if (search.trim()) {
      conditions.push(
        "(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)"
      );
      const term = `%${search.trim()}%`;
      values.push(term, term, term);
    }

    if (departmentId !== undefined) {
      const id = Number(departmentId);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          success: false,
          message: "department_id must be a positive integer",
        });
      }
      conditions.push("e.department_id = ?");
      values.push(id);
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "status must be active or inactive",
        });
      }
      conditions.push("e.status = ?");
      values.push(status);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [employees] = await pool.execute(
      `SELECT e.id, e.first_name, e.last_name, e.email, e.phone,
              e.salary, e.status, e.department_id, e.hire_date,
              e.created_at, e.updated_at, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       ${where}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM employees e ${where}`,
      values
    );

    return res.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employees",
    });
  }
};

// 2. Get one employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const [rows] = await pool.execute(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employee",
    });
  }
};

// 3. Create an employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      salary,
      status = "active",
      department_id,
      hire_date,
    } = req.body || {};

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      salary === undefined ||
      department_id === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "first_name, last_name, email, salary and department_id are required",
      });
    }

    const emailValue = email.trim();
    const salaryValue = Number(salary);
    const deptId = Number(department_id);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!Number.isFinite(salaryValue) || salaryValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Salary must be a non-negative number",
      });
    }

    if (!Number.isInteger(deptId) || deptId < 1) {
      return res.status(400).json({
        success: false,
        message: "department_id must be a positive integer",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be active or inactive",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO employees
       (first_name, last_name, email, phone, salary, status,
        department_id, hire_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        emailValue,
        phone || null,
        salaryValue,
        status,
        deptId,
        hire_date || null,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: rows[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        success: false,
        message: "The selected department does not exist",
      });
    }

    console.error("Create employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
    });
  }
};

// 4. Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const allowedFields = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "salary",
      "status",
      "department_id",
      "hire_date",
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        let value = req.body[field];

        if (
          ["first_name", "last_name", "email"].includes(field) &&
          (typeof value !== "string" || !value.trim())
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be empty`,
          });
        }

        if (["first_name", "last_name", "email"].includes(field)) {
          value = value.trim();
        }

        if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid email address",
          });
        }

        if (field === "salary") {
          value = Number(value);
          if (!Number.isFinite(value) || value < 0) {
            return res.status(400).json({
              success: false,
              message: "Salary must be a non-negative number",
            });
          }
        }

        if (field === "department_id") {
          value = Number(value);
          if (!Number.isInteger(value) || value < 1) {
            return res.status(400).json({
              success: false,
              message: "department_id must be a positive integer",
            });
          }
        }

        if (field === "status" && !["active", "inactive"].includes(value)) {
          return res.status(400).json({
            success: false,
            message: "status must be active or inactive",
          });
        }

        updates.push(`${field} = ?`);
        values.push(value === "" && field === "phone" ? null : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await pool.execute(
      `UPDATE employees SET ${updates.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    const [rows] = await pool.execute(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Employee updated successfully",
      data: rows[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        success: false,
        message: "The selected department does not exist",
      });
    }

    console.error("Update employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
};

// 5. Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
};