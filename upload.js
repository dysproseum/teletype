var uploadingFile;
var fileTimer;
const fileTimeout = 5000;

const confirmFileUpload = function(file) {
  return confirm("Send " + file.name + " (" + file.size.toLocaleString('en') + " bytes)?");
};

const startFileTransfer = function(files) {
  var file = files[0]; // File object.
  if (file && confirmFileUpload(file)) {
    sendfile.disabled = true;
    readBinaryFile(file);
  }
  document.body.classList.remove('dragover');
};

window.addEventListener("load", function() {
  // https://stackoverflow.com/questions/22659164/read-a-drag-and-dropped-file
  textscreen.addEventListener('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!uploadingFile) {
      document.body.classList.add('dragover');
    }
  }, false);

  textscreen.addEventListener('dragleave', function() {
    document.body.classList.remove('dragover');
  });

  sendfile.addEventListener('click', function() {
    filedrop.click();
  });

  filedrop.addEventListener('change', function(e) {
    e.stopPropagation();
    e.preventDefault();
    const files = e.target.files;
    startFileTransfer(files);
  });

  textscreen.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();

    if (sendfile.disabled) {
      alert('File transfer in progress');
      document.body.classList.remove('dragover');
    }
    else {
      const files = e.dataTransfer.files; // FileList object.
      startFileTransfer(files);
    }
  }, false);
});

const downloadFile = function(content, filename, mimeType = 'text/plain') {
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

const fileTimedOut = function() {
  console.log('File transfer stalled.');
  // @todo consolidate file and progress bar code.
  // receivingFile = null;
  // percent = 0;
  // status_file_fill.style.left = '-212px';
  sendfile.disabled = false;
};

var counter;
var bytes;
function sendBinaryChunk() {

  // @todo check for error or offline.

  if (counter == 0) {
    console.log("Upload started.");
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
    percent = counter / bytes.length * 100;

    // Update display.
    updateXfer();

    // filedone.wav
    console.log("Upload completed.");
    bytes = null;
    uploadingFile = null;
    // Re-enable uploads.
    sendfile.disabled = false;

    return;
  }

  // Prepare message.
  var obj = new Object();
  obj.filename = uploadingFile.name;
  obj.letra = bytes[counter];
  obj.caret = counter;
  var message = JSON.stringify(obj);
  // console.log(obj.letra.toString(16));

  // Send to websocket.
  socket.send(message);
  sent++;
  percent = counter / bytes.length * 100;

  // Update display.
  updateXfer();

  counter++;
}

function readBinaryFile(file) {
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
