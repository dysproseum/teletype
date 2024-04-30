var url = '/teletype/post.php';
var pre_stamp = 0;
window.onload = function() {
  var textscreen = document.getElementById("textscreen");
  var statusbar = document.getElementById("statusbar");
  var buffer = '';
  var c = '.';
  var size = 2080;
  for(var i=0; i < size; i++) {
    buffer += c;
  }
  textscreen.value = buffer;

  textscreen.onkeydown = function(e) {
    console.log(e);
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
	console.log(msg);

        // Send this back to server (ping.js).
	console.log(e.timeStamp);
	    console.log(parseInt(e.timeStamp));
	var stamp = parseInt(pre_stamp) + parseInt(e.timeStamp);
        loadDoc(url + "?letra=" + e.key + "&caret=" + caret + "&stamp=" + stamp + "&pre_stamp=" + pre_stamp);

        var output = text.substring(0, caret);
        this.value = output + key + text.substring(caret + 1);
        setCaretPosition('textscreen', caret + 1);
        return false;
    }
    return false;
  };

  // @todo setTimeout to check for new data.
  var timeout;
  var timeOut = function() {
    loadDoc(url + "?pre_stamp=" + pre_stamp);
    timeout = setTimeout(timeOut, 5000);
  };
  timeOut();

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
