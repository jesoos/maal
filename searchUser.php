<?php // searchUser.php
  require_once 'functions.php';

  isset($_GET['term']) or die('[]');
  $term = escapeString($_GET['term']);
  echo json_encode(selectValues('nick', 'users', "nick like '%$term%'"));
?>
