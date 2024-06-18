<!DOCTYPE html>
<html>
<head>
<title>Teletype | Dysproseum</title>
<link rel="stylesheet" type="text/css" href="style.css">
<link rel='stylesheet' media='only screen and (max-width: 768px)' href='mobile.css' type='text/css' />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
<script type="text/javascript" src="teletype.js"></script>
<body>
  <div class="window">
    <h1>Teletype</h1>
    <div class="sidebar">
      <a href="index.php?port=com1"><h2>COM1</h2></a>
      <a href="index.php?port=com2"><h2>COM2</h2></a>
      <a href="index.php?port=com3"><h2>COM3</h2></a>
      <a href="index.php?port=com4"><h2>COM4</h2></a>
    </div>
    <div class="monitor">
      <?php include "com.inc.php"; ?>
    </div>
  </div>
</body>
