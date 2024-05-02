<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
  header('HTTP/1.0 403 Forbidden', TRUE, 403);
  exit('Forbidden');
}

require_once('database.php');
$port = getComPort();

if (isset($_REQUEST['letra'])) {
  $letra = $_REQUEST['letra'];
  $caret = $_REQUEST['caret'];
  $stamp = $_REQUEST['stamp'];

  // Store the values.
  updateRow($port, $letra, $caret, $stamp);
  print json_encode([]);
  exit;
}
else {
  if (isset($_REQUEST['pre_stamp'])) {
    $pre_stamp = $_REQUEST['pre_stamp'];
  }
  else {
    $pre_stamp = 0;
  }

  // Get the values.
  $queue = getRowsCom1($port, $pre_stamp);
  print json_encode($queue);
  exit;
}
