<?php // updatePass.php
  require_once 'functions.php';

  $id   = getPost('id');
  $pass = getPost('pass');
  if ($id && $pass) {
    $pass = escapeString(getHash($pass));
    echo sqlUpdate('users', "pass='$pass'", "id=$id");
  }
?>
