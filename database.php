<?php

// Connect to the database.
require_once('config.php');
global $conf;
$db = $conf['database'];

global $mysqli;
$mysqli = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
if($mysqli->connect_error) {
  exit('Error connecting to database'); //Should be a message a typical user could understand in production
}
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$mysqli->set_charset("utf8mb4");

// Create table.
try {
  $test = $mysqli->query("SELECT letra FROM queue");
} catch (mysqli_sql_exception $e) {
  $query = "CREATE TABLE queue (
  letra varchar(255) NOT NULL,
  caret int(11),
  stamp varchar(255)
  )";
  $mysqli->query($query);
}

// Helper function to create a row in the database.
function newRow($letra, $caret, $stamp) {
  global $mysqli;
  $stmt = $mysqli->prepare("INSERT INTO queue (letra, caret, stamp) VALUES (?, ?, ?)");
  $stmt->bind_param('sis',
    $letra,
    $caret,
    $stamp
  );
  $stmt->execute();
  $stmt->close();
}

// Helper function to return posts created and shared with a user.
function getRows() {
  global $mysqli;
  $stmt = $mysqli->prepare("SELECT * FROM queue");
  $stmt->execute();
  $result = $stmt->get_result();
  $stmt->close();
  $posts = [];
  foreach ($result as $row) {
    $posts[] = $row;
  }
  return $posts;
}

