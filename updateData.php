<?php // updateData.php
  require_once 'functions.php';

  $set = '';
  if (isset($_POST['a'])) {  // [0]=id [1]=user
    $a = explode(',', $_POST['a']);
    if (count($a) == 2) {
      $set = $a[1] == '0'? "t=now()": "user=$a[1]";
    } else if (isset($_POST['data'])) {
      $set = "data='".escapeString($_POST['data'])."'";
    }
  }
  $set and (print sqlUpdate('texts', $set, "id=$a[0]"));
?>
