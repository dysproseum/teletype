<h2 id="label">tmodem</h2>
<form>
	<label for="baud_rate">Baud rate</label>
		<select name="baud_rate">
			<option value="2400">2400</option>
			<option value="4800">4800</option>
			<option value="9600">9600</option>
			<option value="14400">14400</option>
			<option value="33600">33600</option>
			<option value="57600">57600</option>
			<option value="115200">115200</option>
	</select>
	<input type="button" value="Reconnect" />
</form>
<div class="window">
<textarea name="screen" id="textscreen" spellcheck="false" cols="80" rows="25">
</textarea>
<div id="statusbar">
  <span id="general">Serial connection on COM1</span>
  <span id="message"></span>
</div>
</div>
