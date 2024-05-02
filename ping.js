/**
 * Javascript for comment ping functionality.
 */

var parsed = 0;

function loadDoc(url, force = false) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);

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
          delay = ratio * Math.abs(pre_stamp - item.stamp);
          if (delay > (min * 2)) {
            delay = 2500;
          }
          setTimeout(function() {
            var text = textscreen.value;
            var output = text.substring(0, item.caret);
            var caret = getCaret(textscreen);

            textscreen.value = output + item.letra + text.substring(item.caret + 1);
            setCaretPosition('textscreen', caret);

            parsed++;
            var statusbar = document.getElementById("message");
            statusbar.innerText = "Received " + parsed + " packets";

            // All caught up.
    	    if (max > pre_stamp) {
    	      pre_stamp = max;
              // parsed = 0;
    	    }
          }, delay);
        });
      }
    };
    xhttp.open("POST", url, true);
    xhttp.send();
    return true;
}
