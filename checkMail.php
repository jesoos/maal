<?php // checkMail.php
  require_once 'functions1.php';
  echo getMailUser($_POST['mail'])? '1': '0';
?>
