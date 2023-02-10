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
        var msg = "Received " + event_size + " packets";
        statusbar.innerText = msg;
        //var caret = getCaret(textscreen);

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
        var ratio = 3000 / max;

        // Replay input sequence
        data.forEach(function(item) {
          delay = ratio * item.stamp;
          if (delay > (min * 2)) {
            console.log(delay);
          }
          setTimeout(function() {
            var text = textscreen.value;
            var output = text.substring(0, item.caret);
            textscreen.value = output + item.letra + text.substring(item.caret + 1);
            parsed++;
            statusbar.innerText = "Parsed " + parsed + "/" + event_size + " packets";
          }, delay);
        });

        var msg = "Parsed " + data.length + " events";
        //setCaretPosition('textscreen', caret);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
    return true;
}
