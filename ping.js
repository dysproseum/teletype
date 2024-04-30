/**
 * Javascript for comment ping functionality.
 */

var event_size = -1;
var parsed = 0;

function loadDoc(url, force = false) {
    if (!force && parsed < event_size) {
      return;
    }
    var statusbar = document.getElementById("message");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        var len = data.length;
        if (len == event_size) {
          // All caught up.
          return;
        }
        else if (len > event_size) {
          // Remove events we've already parsed.
          data.splice(0,event_size);
          event_size = len;
        }
	if (event_size > parsed) {
          var msg = "Received " + event_size + " packets";
	}
	else {
          var msg = "Received " + parsed + " packets";
	}
        statusbar.innerText = msg;

        // Calculate delays.
        var max = 0;
        var min = 0;
        var delay = 0;
        data.forEach(function(item) {
          if (item.stamp > max) {
            max = item.stamp;
          }
        });
        min = max;
        data.forEach(function(item) {
          if (item.stamp < min) {
            min = item.stamp;
          }
        });

	// All caught up.
	if (max > pre_stamp) {
	  //pre_stamp = max;
	}
	else {
	  //return;
	}

        // Replay input sequence
        var ratio = 5000 / max;
        data.forEach(function(item) {
          delay = ratio * item.stamp;
          if (delay > (min * 2)) {
            console.log(delay);
            delay = 3000;
          }
          setTimeout(function() {
            var text = textscreen.value;
            var output = text.substring(0, item.caret);
            var caret = getCaret(textscreen);

            textscreen.value = output + item.letra + text.substring(item.caret + 1);
            setCaretPosition('textscreen', caret);

            parsed++;
            statusbar.innerText = "Parsed " + parsed + "/" + event_size + " packets";

            // All caught up.
    	    if (max > pre_stamp) {
    	      pre_stamp = max;
              // parsed = 0;
    	    }
          }, delay);
        });
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
    return true;
}
