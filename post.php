<?php

include 'database.php';
if (isset($_REQUEST['letra'])) {

  // store the values
  $letra = $_REQUEST['letra'];
  $caret = $_REQUEST['caret'];
  $stamp = $_REQUEST['stamp'];

  //var $mysqli?
  //newRow($letra, $caret, $stamp);
  updateRow($letra, $caret, $stamp);
}

// retrieve the values
//$queue = getRows();
if (isset($_REQUEST['pre_stamp'])) {
  $pre_stamp = $_REQUEST['pre_stamp'];
}
else {
  $pre_stamp = 0;
}
$queue = getRowsCom1($pre_stamp);
print json_encode($queue);
exit;
