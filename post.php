<?php

include 'database.php';
if (isset($_REQUEST['letra'])) {

  // store the values
  $letra = $_REQUEST['letra'];
  $caret = $_REQUEST['caret'];
  $stamp = $_REQUEST['stamp'];

  //var $mysqli?
  newRow($letra, $caret, $stamp);
}

// retrieve the values
$queue = getRows();
print json_encode($queue);
exit;
