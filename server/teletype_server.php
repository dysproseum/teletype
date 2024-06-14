#!/usr/bin/env php
<?php

require_once('./websockets.php');

class teletypeServer extends WebSocketServer {

  function __construct($addr, $port, $bufferLength) {
    parent::__construct($addr, $port, $bufferLength);
  }

  protected $maxBufferSize = 4096;
  protected $tickCount = 0;
  protected $ticksPerPing = 4;

  protected function process($user, $message) {
    foreach ($this->users as $u) {
      if ($u->id == $user->id) {
        continue;
      }
      $this->send($u, $message);
    }
  }

  protected function connected($user) {
    // Do nothing: This is just an echo server, there's no need to track the user.
    // However, if we did care about the users, we would probably have a cookie to
    // parse at this step, would be looking them up in permanent storage, etc.
  }

  protected function closed($user) {
    // Do nothing: This is where cleanup would go, in case the user had any sort of
    // open files or other objects associated with them.  This runs after the socket
    // has been closed, so there is no need to clean up the socket itself here.
  }

  protected function tick() {
    $this->tickCount++;
    if ($this->tickCount < $this->ticksPerPing) {
      return;
    }
    $this->tickCount = 0;
    $cnt = sizeof($this->users);
    if ($cnt == 0) {
      return;
    }
    foreach ($this->users as $id => $user) {
      $message = json_encode([
        'numUsers' => $cnt,
      ]);
      $this->send($user, $message, 'ping');
    }
  }
}

$port = $argv[1];
$echo[$port] = new teletypeServer("127.0.0.1", $port, 4096);

try {
  $echo[$port]->run();
}
catch (Exception $e) {
  $echo[$port]->stdout($e->getMessage());
}
