<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include '../config/config.php';

$success = false;

$data = [];

$connection = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
mysqli_query ($connection, 'SET NAMES utf8');

$query = "SELECT * FROM `chess_games` ORDER BY id DESC";
$result = mysqli_query($connection, $query);

$data = mysqli_fetch_all($result, MYSQLI_ASSOC);

if ($result) {
	$message = 'Gry zostały pobrane.';
	$success = true;
} 
else {
	$message = 'Gry nie zostały pobrane.';
	$success = false;
}

mysqli_close($connection);

echo json_encode (
	array (
		'success' => $success,
		'message' => $message,
		'data' => $data,
	)
);

?>
