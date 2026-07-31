<?php
session_start();
header("Content-Type: application/json");
require_once "db.php";

// Only POST thi login allow kariye
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method allowed."]);
    exit;
}

$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Valid email enter karo."]);
    exit;
}

if ($password === "") {
    echo json_encode(["success" => false, "message" => "Password required che."]);
    exit;
}

// Email thi user fetch kari ne password verify kariye
$stmt = $conn->prepare("SELECT id, full_name, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user["password"])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    $stmt->close();
    $conn->close();
    exit;
}

// Basic session set kariye so login state store thai
$_SESSION["user_id"] = $user["id"];
$_SESSION["user_name"] = $user["full_name"];
$_SESSION["user_email"] = $user["email"];

echo json_encode([
    "success" => true,
    "message" => "Login successfully thai gayu.",
    "user" => [
        "id" => $user["id"],
        "full_name" => $user["full_name"],
        "email" => $user["email"]
    ]
]);

$stmt->close();
$conn->close();
