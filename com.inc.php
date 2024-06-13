<?php
  require_once('config.php');
  global $conf;

  if (isset($_GET['port'])) {
    $port = $_GET['port'];
  }
  else {
    $port = 'com1';
  }
  if (!isset($conf[$port])) {
    header('HTTP/1.1 404 Not Found');
    exit('Invalid port');
  }
?>

<script type="text/javascript">
  var socket_uri = '<?php print $conf[$port]; ?>';
  var com_port = '<?php print $port; ?>';
</script>

<h2 id="label">tmodem on <?php print strtoupper($port); ?></h2>
<div class="statusbar">
<form>
	<label for="baud_rate">Baud rate</label>
		<select id="baud_rate">
			<option value="2400">2400</option>
			<option value="4800">4800</option>
			<option value="9600">9600</option>
			<option value="14400">14400</option>
			<option value="33600">33600</option>
			<option value="57600">57600</option>
			<option value="115200">115200</option>
	</select>
	<input type="button" id="connect" value="Connect" />
	<input type="button" id="disconnect" value="Disconnect" disabled="disabled" />
</form>
</div>
<div class="content">
  <textarea name="screen" id="textscreen" spellcheck="false" cols="80" rows="25" disabled="disabled"></textarea>
  <div id="statusbar">
    <span id="status_conn">Disconnected.</span>
    <span id="status_type"></span>
    <span id="status_mesg"></span>
    <span id="status_xfer"></span>
  </div>
</div>
