<?php // getHelp.php
  require_once 'functions.php';
  $row = selectRow('t,data', 'texts e JOIN words w ON e.word=w.id',
                             "w.word='?' AND i=0 ORDER BY t DESC LIMIT 1");
  echo $row[1];
?>
