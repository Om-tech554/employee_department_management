
const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authenticateToken = require("../middleware/authMiddleware");

// Protect all employee endpoints with JWT authentication
router.use(authenticateToken);

router.get("/", employeeController.getAllEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;