const c = '.';
var bufferSize = 80 * 25;
var received = 0;
var sent = 0;
var timeOut;
var socket;
var numUsers = 0;

window.onload = function() {

  var textscreen = document.getElementById('textscreen');
  var menubar = document.getElementById('menubar');
  menubar.clientWidth = textscreen.clientWidth;
  toggleConnection(false);

  connect.onclick = function() {
    toggleConnection(true);
    textscreen.value = '';
    received = 0;

    var fillBuffer = function() {
      if (received >= bufferSize) {
        initSocket();
      }
      else {
        textscreen.value += c;
        received++;
        updateXfer();
        timeOut = setTimeout(fillBuffer, 115200 / baud_rate.value);
      }
    };
    fillBuffer();
  }

  disconnect.onclick = function() {
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
        var caret = getCaret() - 80;
        if (caret < 0) {
          caret = 0;
        }
        setCaretPosition(caret);
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
        }
        setCaretPosition(caret);
        return false;
      case 'Backspace':
        setCaretPosition(caret - 1);
        return false;
    }

    var caret = getCaret();
    if (caret >= bufferSize) {
      return false;
    }

    if (encoding.value == "ascii") {
      e.key = e.key.replace(/[^\x00-\xFF]/g, "");
    }

    // Prepare message.
    var obj = new Object();
    obj.letra = e.key;
    obj.caret = caret;
    var message = JSON.stringify(obj);

    // Send to websocket.
    socket.send(message);
    sent++;

    // Update display.
    typeTextscreen(caret, e.key, true);
    updateXfer();
    return false;
  };

  textscreen.onpaste = function(e) {
    var clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    // Check for newlines.
    pastedData = pastedData.replace(/\s+/g, ' ').trim();

    if (encoding.value == "ascii") {
      pastedData = pastedData.replace(/[^\x00-\xFF]/g, "");
    }

    // Prepare message.
    var obj = new Object();
    obj.paste = pastedData;
    obj.caret = getCaret();
    var message = JSON.stringify(obj);
    socket.send(message);

    // Update display.
    pasteTextscreen(obj.paste, obj.caret, true);
    return false;
  };
}

function initSocket() {
  // Set up websocket.
  socket = new WebSocket(socket_uri);

  socket.onopen = function() {
    console.log("Websocket opened.");
    status_conn.innerText = "Connected";
    textscreen.disabled = false;
    textscreen.focus();
    setCaretPosition(0);
  };

  socket.onclose = function() {
    console.log("Websocket closed.");
    toggleConnection(false);
    received = 0;
    sent = 0;
  };

  socket.onmessage = function(message) {
    if (message.data == 'ping') {
      return;
    }

    var item = JSON.parse(message.data);

    if (item.numUsers) {
      if (numUsers != item.numUsers) {
        numUsers = item.numUsers;
        if (numUsers == 1) {
          status_mesg.innerText = "1 user online";
        }
        else {
          status_mesg.innerText = numUsers + " users online";
        }
      }
      return;
    }

    if (item.paste) {
      pasteTextscreen(item.paste, item.caret);
    }

    if (item.letra) {
      typeTextscreen(item.caret, item.letra);
    }

    received++;
    updateXfer();
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

function typeTextscreen(caret, letra, typed) {
  var text = textscreen.value;
  var currentCaret = getCaret();
  var output = text.substring(0, caret);
  textscreen.value = output + letra + text.substring(caret + 1);
  if (typed) {
    currentCaret++;
  }
  setCaretPosition(currentCaret);
}

function pasteTextscreen(pastedData, caret, typed) {
  var text = textscreen.value;
  var currentCaret = getCaret();
  var len = pastedData.length;
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

  textscreen.value = output;
  if (typed) {
    currentCaret = caret + len;
  }
  setCaretPosition(currentCaret);
}

function updateXfer() {
  status_xfer.innerText = "Received " + received + " / Sent " + sent;
}

function toggleConnection(conn) {
  if (conn) {
    status_conn.innerText = "Connecting...";
    status_type.innerText = "Serial connection on " + com_port.toUpperCase();
    status_mesg.innerText = "Offline";
    received = 0;
    sent = 0;
  }
  else {
    status_conn.innerText = "Disconnected";
    status_type.innerText = "Serial connection on " + com_port.toUpperCase();
    status_mesg.innerText = "Offline";
    textscreen.disabled = true;
    numUsers = 0;
  }
  updateXfer();
  connect.disabled = conn;
  disconnect.disabled = !conn;

}
