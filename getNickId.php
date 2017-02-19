<?php // getNickId.php
  require_once 'functions.php';
  $id = selectValue('id', 'users', "nick='".escapeString($_POST['nick'])."'");
  echo $id? $id: '0';
?>
