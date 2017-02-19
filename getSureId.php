<?php // getSureId.php
  require_once 'functions.php';
  $row = selectRow('id,rank', 'users', "nick='".escapeString($_POST['sure'])."'");
  echo $row && 0 < $row[1]? $row[0]: '0';
?>
