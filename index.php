<html>
<head>
<title>Teletype | Dysproseum</title>
<link rel="stylesheet" type="text/css" href="style.css">
<script type="text/javascript" src="ping.js"></script>
<script type="text/javascript" src="teletype.js"></script>
<body>
  <h1>Teletype</h1>
  <div class="sidebar">
    <a href="index.php?port=com1"><h2>COM1</h2></a>
    <a href="index.php?port=com2"><h2>COM2</h2></a>
    <a href="index.php?port=com3"><h2>COM3</h2></a>
    <a href="index.php?port=com4"><h2>COM4</h2></a>
  </div>
  <div class="monitor">
    <?php include "com1.html"; ?>
  </div>
</body>
