<?php // checkNick.php
  require_once 'functions1.php';
  echo getNickId($_POST['nick'])? '1': '0';
?>
