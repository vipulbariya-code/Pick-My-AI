<?php
// Simple DB connection file, badha auth pages ma reuse karva mate
$host = "localhost";
$username = "root";
$password = "";
$database = "project_db";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// UTF-8 set kariye so text properly save/read thay
$conn->set_charset("utf8mb4");
