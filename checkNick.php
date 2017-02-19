<?php // checkNick.php
  require_once 'getNickIdSureId.php';
  echo getNickId($_POST['nick'])? '1': '0';
?>
