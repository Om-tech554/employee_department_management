
const db = require("../config/db");

// 1. Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const [departments] = await db.query(
      "SELECT id, name, description, created_at FROM departments ORDER BY id DESC"
    );

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

// 2. Get one department
exports.getDepartmentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const [rows] = await db.query(
      "SELECT id, name, description, created_at FROM departments WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch department",
    });
  }
};

// 3. Create a department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    const cleanName = name.trim();
    const cleanDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;

    const [result] = await db.query(
      "INSERT INTO departments (name, description) VALUES (?, ?)",
      [cleanName, cleanDescription]
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: {
        id: result.insertId,
        name: cleanName,
        description: cleanDescription,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A department with this name already exists",
      });
    }

    console.error("Create department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
};

// 4. Update a department
exports.updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    const cleanName = name.trim();
    const cleanDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;

    const [result] = await db.query(
      "UPDATE departments SET name = ?, description = ? WHERE id = ?",
      [cleanName, cleanDescription, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found or no changes made",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A department with this name already exists",
      });
    }

    console.error("Update department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
};

// 5. Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const [result] = await db.query(
      "DELETE FROM departments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a department that has employees",
      });
    }

    console.error("Delete department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete department",
    });
  }
};