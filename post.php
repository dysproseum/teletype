<?php

include 'database.php';
$port = getComPort();

if (isset($_REQUEST['letra'])) {
  // Store the values.
  $letra = $_REQUEST['letra'];
  $caret = $_REQUEST['caret'];
  $stamp = $_REQUEST['stamp'];

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
  $queue = getRowsCom1($port, $pre_stamp);
  print json_encode($queue);
  exit;
}
