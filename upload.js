var uploadingFile;
var receivingFile;

window.addEventListener("load", function() {
  // https://stackoverflow.com/questions/22659164/read-a-drag-and-dropped-file
  var file_drop = document.getElementById('file-drop');
  file_drop.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, false);

  file_drop.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;	// FileList object.
    var file = files[0];                // File     object.
    console.log(file);
    readBinaryFile(file);
  }, false);
});

function downloadFile(content, filename, mimeType = 'text/plain') {
  // https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up
}

var counter;
var bytes;
function sendBinaryChunk() {

  // @todo check for error or offline.

  if (counter == 0) {
    console.log("first frame");
    // Prepare special start message (length).
    var obj = new Object();
    obj.filename = uploadingFile.name;
    obj.letra = 'start';
    obj.caret = bytes.length;
    var message = JSON.stringify(obj);
  
    // Send to websocket.
    socket.send(message);
    sent++;
  }

  if (counter >= bytes.length) {
    clearInterval(timeOut);
 
    // Prepare explicit "done" message.
    var obj = new Object();
    obj.filename = uploadingFile.name;
    obj.letra = 'done';
    obj.caret = bytes.length;
    var message = JSON.stringify(obj);
  
    // Send to websocket.
    socket.send(message);
    sent++;

    // filedone.wav
    console.log("upload done");
    body = null;

    return;
  }

  // Prepare message.
  var obj = new Object();
  obj.filename = uploadingFile.name;
  obj.letra = bytes[counter];
  obj.caret = counter;
  var message = JSON.stringify(obj);
  console.log(obj.letra.toString(16));

  // Send to websocket.
  socket.send(message);
  sent++;

  // Update display.
  updateXfer();

  counter++;
}

function readBinaryFile(file) {
 //var file = e.dataTransfer.files[0],
  uploadingFile = file;

  reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = function() {
    var arrayBuffer = reader.result
    bytes = new Uint8Array(arrayBuffer);
    counter = 0;
    timeOut = setInterval(sendBinaryChunk, 1000 / baud_rate.value / 8);
  }
}
