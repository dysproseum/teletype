var parsed = 0;

window.onload = function() {
  var textscreen = document.getElementById("textscreen");
  var statusbar = document.getElementById("statusbar");
  var label = document.getElementById("label");
  label.innerText = "tmodem on " + com_port.toUpperCase();
  var general = document.getElementById("general");
  general.innerText = "Serial communication on " + com_port.toUpperCase();

  var buffer = '';
  var c = '.';
  var size = 2080;
  for(var i=0; i < size; i++) {
    buffer += c;
  }
  textscreen.value = buffer;

  textscreen.onkeydown = function(e) {
    // Backspace, Delete, Enter, Control.
    if (e.keyCode == 8 || e.keyCode == 46 || e.keyCode == 13 || e.keyCode == 17) {
      return false;
    }
  };

  textscreen.onkeypress = function(e) {
    var key = String.fromCharCode(e.which || e.charCode || e.keyCode);
    if (/[A-Za-z0-9 ]/.test(key)) {
        var text = this.value;
        var caret = getCaret(this);

        var msg = "Input: " + e.key + " position " + caret + " time " + e.timeStamp;

        // Prepare message.
        var obj = new Object();
        obj.letra = e.key;
        obj.caret = caret;
        var message = JSON.stringify(obj);

        // Send to websocket.
        socket.send(message);

        var output = text.substring(0, caret);
        this.value = output + key + text.substring(caret + 1);
        setCaretPosition('textscreen', caret + 1);
        return false;
    }
    return false;
  };

  socket = new WebSocket(socket_uri);
  socket.onopen = function() {
    console.log("Websocket opened.");
  };
  socket.onclose = function() {
    console.log("Websocket closed.");
  };
  socket.onmessage = function(message) {
    if (message.data == 'ping') {
      return;
    }
    var item = JSON.parse(message.data);

    var text = textscreen.value;
    var output = text.substring(0, item.caret);
    var caret = getCaret(textscreen);

    textscreen.value = output + item.letra + text.substring(item.caret + 1);
    setCaretPosition('textscreen', caret);

    parsed++;
    var statusbar = document.getElementById("message");
    statusbar.innerText = "Received " + parsed + " packets";
  };

}

function getCaret(el) { 
  if (el.selectionStart) { 
    return el.selectionStart; 
  } else if (document.selection) { 
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

function setCaretPosition(elemId, caretPos) {
    var elem = document.getElementById(elemId);

    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos + 1);
            }
            else
                elem.focus();
        }
    }
}
