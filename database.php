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

// Create tables.
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

// Create com tables.
$tables = [
  'com1',
  'com2',
  'com3',
  'com4'
];
foreach ($tables as $table) {
  try {
    $stmt = $mysqli->prepare("SELECT letra FROM " . $table . " LIMIT 1");
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    $posts = [];
    foreach ($result as $row) {
      $posts[] = $row;
    }
    if (sizeof($posts) == 0) {
      $letra = '.';
      $stamp = '0';
      for ($caret=0; $caret < 2080; $caret++) {
        $stmt = $mysqli->prepare("INSERT INTO " . $table . " (letra, caret, stamp) VALUES (?, ?, ?)");
        $stmt->bind_param('sis',
          $letra,
          $caret,
          $stamp
        );
        $stmt->execute();
      }
    }
  } catch (mysqli_sql_exception $e) {
    $mysqli->query("CREATE TABLE IF NOT EXISTS " . $table . " (
        letra varchar(255) NOT NULL,
        caret int(11),
        stamp int(11)
      )"
    );
  }
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

// Helper function to update a row in the database.
function updateRow($table, $letra, $caret, $stamp) {
  global $mysqli;
  $stmt = $mysqli->prepare("UPDATE " . $table . " SET letra=?, stamp=? WHERE caret = ?");
  $stmt->bind_param('ssi',
    $letra,
    $stamp,
    $caret
  );
  $stmt->execute();
  $stmt->close();
}

// Helper function to return posts created and shared with a user.
function getRowsCom1($table = 'com1', $stamp = 0) {
  global $mysqli;
  $stmt = $mysqli->prepare("SELECT * FROM " . $table . " WHERE stamp > ?");
  $stmt->bind_param('i', $stamp);
  $stmt->execute();
  $result = $stmt->get_result();
  $stmt->close();
  $posts = [];
  foreach ($result as $row) {
    $posts[] = $row;
  }
  return $posts;
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

function getComPort() {
  if (isset($_REQUEST['port'])) {
    $port = $_REQUEST['port'];
    $validated_port = '';
    switch($port) {
      case 'com1':
        $validated_port = $port;
	break;
      case 'com2':
        $validated_port = $port;
	break;
      case 'com3':
        $validated_port = $port;
	break;
      case 'com4':
        $validated_port = $port;
	break;
      default:
	$validated_port = 'com1';
	break;
    }
    return $validated_port;
  }
}
