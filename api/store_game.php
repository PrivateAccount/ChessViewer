<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../config/config.php';

$entity_body = file_get_contents('php://input');

$payload = json_decode($entity_body);

$success = false;

$steps = [];

foreach ($payload as $key => $value) {
	if ($key == 'user') $user = htmlspecialchars(trim($value));
	if ($key == 'email') $email = htmlspecialchars(trim($value));
	if ($key == 'sequences') $sequences = intval(trim($value));
	if ($key == 'details') {
		foreach ($value as $step) {
			$steps[] = $step;
		}
	}
}

if (!empty($user) && !empty($email) && !empty($sequences) && count($steps)) {
	
	$connection = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	mysqli_query ($connection, 'SET NAMES utf8');
	
	$ip = $_SERVER['REMOTE_ADDR'];

	$query = "INSERT INTO `chess_games` (`id`, `ip`, `user`, `email`, `modified`, `sequences`)
			  VALUES (NULL, '". $ip ."', '". mysqli_real_escape_string($connection, $user) ."', '". mysqli_real_escape_string($connection, $email) ."', NOW(), '". $sequences ."')"; 
	$result = mysqli_query($connection, $query);

	$query = "SELECT MAX(id) AS identifier FROM `chess_games`";
	$result = mysqli_query($connection, $query);
	
	$row = mysqli_fetch_array($result);
	if ($row['identifier']) {
		$game_id = intval($row['identifier']);
		foreach ($steps as $step) {
			$step->kill = strlen($step->kill) ? $step->kill : -1;
			$query = "INSERT INTO `chess_sequences` (`id`, `game_id`, `figure`, `origin`, `field`, `killed`)
					  VALUES (NULL, '". $game_id ."', '". $step->figure ."', '". $step->origin ."', '". $step->field ."', '". $step->kill ."')"; 
			$result = mysqli_query($connection, $query);
		}
		if ($result) {
			$message = 'Gra została zarejestrowana.';
			$success = true;
		} 
		else {
			$message = 'Gra nie została zarejestrowana.';
			$success = false;
		}
	}
	else {
		$message = 'Brak identyfikatora gry.';
		$success = false;
	}

	mysqli_close($connection);
} 
else {
	$message = 'Nie podano wszystkich wymaganych danych.';
	$success = false;
}

echo json_encode (
	array (
		'success' => $success,
		'message' => $message,
	)
);

?>
