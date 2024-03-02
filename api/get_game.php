<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include '../config/config.php';

$success = false;

$id = intval($_GET['id']);

$data = [];

$connection = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
mysqli_query ($connection, 'SET NAMES utf8');

$query = "SELECT * FROM `chess_sequences` WHERE game_id = ". $id ." ORDER BY id";
$result = mysqli_query($connection, $query);

$data = mysqli_fetch_all($result, MYSQLI_ASSOC);

if ($result) {
	$message = 'Gra została załadowana.';
	$success = true;
} 
else {
	$message = 'Gra nie została załadowana.';
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
