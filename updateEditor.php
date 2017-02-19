<?php // updateEditor.php
  require_once 'functions.php';

  if (isset($_POST['editor'])) {
    $nick = escapeString($_POST['editor']);
    $set = selectValue('id', 'users', "nick='$nick'") or die('2');
    $set = "user=$set";
    isset($_POST['uid']) && isset($_POST['wid']) or die('3');
    $wid = $_POST['wid'];
    sqlUpdate('texts', $set, "word=$wid AND i=0 AND user=".$_POST['uid']) and
    sqlUpdate('words', $set, "id=$wid") and die('1');
    echo '0';
  }
?>
