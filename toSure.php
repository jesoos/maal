<?php // toSure.php
  require_once 'functions.php';

  $id = $_POST['id'];
  echo json_encode(selectRows('id,nick,name,rank', 'users',
                              "sure=$id AND rank < 1"));
?>
