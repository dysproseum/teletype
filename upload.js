// https://stackoverflow.com/questions/22659164/read-a-drag-and-dropped-file

var uploadingFile;
var receivingFile;

window.addEventListener("load", function() {
  var file_drop = document.getElementById('file-drop');
  file_drop.addEventListener(
    'dragover',
    function handleDragOver(evt) {
console.log('dragover event');
return;
      evt.stopPropagation()
      evt.preventDefault()
      evt.dataTransfer.dropEffect = 'copy'
    },
    false
  )
  file_drop.addEventListener(
    'drop',
    function(evt) {
console.log('drop event');
      evt.stopPropagation()
      evt.preventDefault()
      var files = evt.dataTransfer.files  // FileList object.
      var file = files[0]                 // File     object.
      console.log(file);
      readBinaryFile(file);
    },
    false
  )
});

var i = 0;
var body;
function sendBinaryChunk() {

// @todo check for error or offline.

  if (i == 0) {
    console.log("first frame");
    // Prepare special start message (length).
    var obj = new Object();
    obj.filename = uploadingFile.name;
    obj.letra = 'start';
    obj.caret = body.length;
    var message = JSON.stringify(obj);
  
    // Send to websocket.
    socket.send(message);
    sent++;
  }

  console.log(i + '/' + body.length + ': ' + body[i]);

  if (i >= body.length) {
    clearTimeout(timeOut);
    console.log("upload done");
 
    // Prepare explicit "done" message.
    var obj = new Object();
    obj.filename = uploadingFile.name;
    obj.letra = 'done';
    obj.caret = body.length;
    var message = JSON.stringify(obj);
  
    // Send to websocket.
    socket.send(message);
    sent++;

    // filedone.wav
    body = null;

    return;
  }

  // Prepare message.
  var obj = new Object();
  obj.filename = uploadingFile.name;
  obj.letra = body[i];
  obj.caret = i;
  var message = JSON.stringify(obj);

  // Send to websocket.
  socket.send(message);
  sent++;

  // Update display.
  //typeTextscreen(caret, e.key, true);
  sent++;  
  updateXfer();

  i++;
}

function readBinaryFile(file) {
 //var file = e.dataTransfer.files[0],
  uploadingFile = file;

  reader = new FileReader();
  reader.onload = function (event) {
    console.log(event.target.result);
    //holder.style.background = 'url(' + event.target.result + ') no-repeat center';

    // break up string into characters and send with websocket.
    body = event.target.result;
    //timeOut = setInterval(sendBinaryChunk, 500);
    timeOut = setInterval(sendBinaryChunk, 1000 / baud_rate.value / 8);

  };
  //reader.readAsDataURL(file);
  reader.readAsBinaryString(file)
}
