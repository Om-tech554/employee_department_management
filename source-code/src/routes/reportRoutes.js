
const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/department-counts", reportController.getDepartmentCounts);
router.get("/average-salary", reportController.getAverageSalary);
router.get("/highest-paid", reportController.getHighestPaidEmployee);
router.get("/employee-status-counts", reportController.getEmployeeStatusCounts);
router.get("/above-salary", reportController.getEmployeesAboveSalary);

module.exports = router;