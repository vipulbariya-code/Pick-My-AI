<?php
header("Content-Type: application/json");
require_once "db.php";

// Security mate only POST allow kariye
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method allowed."]);
    exit;
}

$fullName = trim($_POST["fullName"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";
$confirmPassword = $_POST["confirmPassword"] ?? "";

if (strlen($fullName) < 2) {
    echo json_encode(["success" => false, "message" => "Full name minimum 2 characters no hovo joiye."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Valid email enter karo."]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(["success" => false, "message" => "Password minimum 8 characters no hovo joiye."]);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(["success" => false, "message" => "Password and confirm password match nathi thatu."]);
    exit;
}

// Pela check kariye ke email already exist to nathi ne
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Aa email thi account already che."]);
    $checkStmt->close();
    $conn->close();
    exit;
}

$checkStmt->close();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Navo user insert kariye
$insertStmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
$insertStmt->bind_param("sss", $fullName, $email, $hashedPassword);

if ($insertStmt->execute()) {
    echo json_encode(["success" => true, "message" => "Signup successfully thai gayu."]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Signup failed. Please try again."]);
}

$insertStmt->close();
$conn->close();
