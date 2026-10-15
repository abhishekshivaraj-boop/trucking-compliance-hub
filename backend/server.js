

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const drivers = [
  {
    id: 1,
    name: "Alex Johnson",
    licenseNumber: "CDL-1001",
    licenseExpiry: "2026-11-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Williams",
    licenseNumber: "CDL-1002",
    licenseExpiry: "2027-06-20",
    status: "Active",
  },
];

app.get("/", (req, res) => {
  res.send("Welcome to Trucking Driver Compliance & ELD Hub API");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Trucking Compliance Hub backend is running",
  });
});

app.get("/api/drivers", (req, res) => {
  res.json(drivers);
});

app.get("/api/drivers/:id", (req, res) => {
  const driver = drivers.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!driver) {
    return res.status(404).json({ message: "Driver not found" });
  }

  res.json(driver);
});

app.post("/api/drivers", (req, res) => {
  const { name, licenseNumber, licenseExpiry, status } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof licenseNumber !== "string" ||
    !licenseNumber.trim() ||
    typeof licenseExpiry !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(licenseExpiry) ||
    Number.isNaN(new Date(`${licenseExpiry}T00:00:00`).getTime())
  ) {
    return res.status(400).json({
      message:
        "Valid name, license number, and expiry date are required.",
    });
  }

  const duplicate = drivers.some(
    (driver) =>
      driver.licenseNumber.toLowerCase() ===
      licenseNumber.trim().toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      message: "This license number already exists.",
    });
  }

  const allowedStatuses = ["Active", "Inactive", "Suspended"];
  const driverStatus = status || "Active";

  if (!allowedStatuses.includes(driverStatus)) {
    return res.status(400).json({
      message: "Invalid driver status.",
    });
  }

  const newDriver = {
    id:
      Math.max(0, ...drivers.map((driver) => Number(driver.id) || 0)) +
      1,
    name: name.trim(),
    licenseNumber: licenseNumber.trim(),
    licenseExpiry,
    status: driverStatus,
  };

  drivers.push(newDriver);

  res.status(201).json({
    message: "Driver added successfully.",
    driver: newDriver,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


