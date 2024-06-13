const c = '.';
var bufferSize = 80 * 25;
var parsed = 0;
var timeOut;
var socket;
var numUsers = 0;

window.onload = function() {

  connect.onclick = function() {
    this.disabled = true;
    disconnect.disabled = false;
    status_conn.innerText = 'Connecting...';
    textscreen.value = '';
    parsed = 0;

    var fillBuffer = function() {
      if (parsed >= bufferSize) {
        initSocket();
        textscreen.disabled = false;
        textscreen.focus();
        setCaretPosition(0);
      }
      else {
        textscreen.value += c;
        parsed++;
        timeOut = setTimeout(fillBuffer, 115200 / baud_rate.value);
      }
    };
    fillBuffer();
  }

  disconnect.onclick = function() {
    connect.disabled = false;
    this.disabled = true;
    clearTimeout(timeOut);
    socket.close();
  };

  textscreen.onclick = function() {
    if (this.selectionStart == this.selectionEnd) {
      setCaretPosition(getCaret());
    }
  };

  textscreen.onkeydown = function(e) {
    switch(e.key) {
      case 'Backspace':
      case 'ArrowLeft':
        setCaretPosition(getCaret() - 1);
        return false;
      case 'ArrowRight':
        setCaretPosition(getCaret() + 1);
        return false;
      case 'ArrowUp':
        setCaretPosition(getCaret() - 80);
        return false;
      case 'ArrowDown':
        setCaretPosition(getCaret() + 80);
        return false;
      case 'Delete':
      case 'Insert':
        return false;
      default:
    }
  };

  textscreen.onkeyup = function(e) {
    switch(e.key) {
      case 'Home':
        setCaretPosition(getCaret());
        return false;
      case 'End':
        setCaretPosition(getCaret() - 1);
        return false;
    }
  }

  textscreen.onkeypress = function(e) {
    var key = String.fromCharCode(e.which || e.charCode || e.keyCode);
    var caret = getCaret();
    switch(e.key) {
      case 'Enter':
        if (caret % 80 == 0 && textscreen.selectionStart == textscreen.selectionEnd) {
          setCaretPosition(caret);
          return false;
        }
        caret++;
        while (caret % 80 != 0) {
          caret++;
          console.log(caret);
        }
        setCaretPosition(caret);
        return false;
      case 'Backspace':
        setCaretPosition(caret - 1);
        return false;
    }

    if (/[A-Za-z0-9 ]/.test(key)) {
        var text = this.value;
        var caret = getCaret();
        if (caret >= bufferSize) {
          return false;
        }

        var msg = "Input: " + e.key + " position " + caret + " time " + e.timeStamp;

        // Prepare message.
        var obj = new Object();
        obj.letra = e.key;
        obj.caret = caret;
        var message = JSON.stringify(obj);

        // Send to websocket.
        socket.send(message);
        parsed++;

        var output = text.substring(0, caret);
        this.value = output + key + text.substring(caret + 1);
        setCaretPosition(caret + 1);
        return false;
    }
    return false;
  };

  textscreen.onpaste = function(e) {
    var clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    // Check for newlines.
    pastedData = pastedData.replace(/\s+/g, ' ').trim();
    var len = pastedData.length;

    // Prepare message.
    var obj = new Object();
    obj.paste = pastedData;
    obj.caret = caret;
    var message = JSON.stringify(obj);
    // socket.send(message);

    var text = this.value;
    var caret = getCaret();
    var output = text.substring(0, caret);
    output += pastedData;

    // Prevent overflow.
    if (output.length > bufferSize) {
      output = output.substring(0, bufferSize);
    }
    var end = caret + len;
    if (end < bufferSize) {
      output += text.substring(end, bufferSize);
    }

    this.value = output;
    setCaretPosition(caret + len);
    return false;
  };
}

function initSocket() {
  // Set up websocket.
  socket = new WebSocket(socket_uri);

  socket.onopen = function() {
    console.log("Websocket opened.");
    status_conn.innerText = "Connected.";
    status_type.innerText = "Serial communication on " + com_port.toUpperCase() + ".";
  };

  socket.onclose = function() {
    console.log("Websocket closed.");
    status_conn.innerText = "Disconnected.";
    status_type.innerText = "";
    status_mesg.innerText = "";
    connect.disabled = false;
    disconnect.disabled = true;
    textscreen.disabled = true;
    parsed = 0;
  };

  socket.onmessage = function(message) {
    if (message.data == 'ping') {
      return;
    }

    var item = JSON.parse(message.data);

    if (item.numUsers) {
      if (numUsers != item.numUsers) {
        numUsers = item.numUsers;
        status_mesg.innerText = numUsers + " users online.";
      }
      return;
    }

    var text = textscreen.value;
    var output = text.substring(0, item.caret);
    var caret = getCaret();

    textscreen.value = output + item.letra + text.substring(item.caret + 1);
    setCaretPosition(caret);

    parsed++;
    status_xfer.innerText = "Received " + parsed + " packets";
  };
}

function getCaret(el) {
  if (!el) {
    el = textscreen;
  }

  if (el.selectionStart) {
    return el.selectionStart;
  }
  else if (document.selection) {
    el.focus();

    var r = document.selection.createRange();
    if (r == null) {
      return 0; 
    } 

    var re = el.createTextRange(), 
        rc = re.duplicate(); 
    re.moveToBookmark(r.getBookmark()); 
    rc.setEndPoint('EndToStart', re); 

    return rc.text.length; 
  }  
  return 0; 
}

function setCaretPosition(caretPos, elem) {
  if (!elem) {
    elem = textscreen;
  }

  if(elem != null) {
    if(elem.createTextRange) {
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    }
    else {
      elem.focus();
      elem.setSelectionRange(caretPos, caretPos + 1);
    }
  }
}
