<?php // addData.php
  require_once 'functions.php';

  if (isset($_POST['a']) && isset($_POST['data'])) {
    $a    = explode(',', $_POST['a']);  // 0=i 1=word 2=user
    $data = escapeString($_POST['data']);
    echo sqlInsert('texts', 'i,word,user,data', "$a[0],$a[1],$a[2],'$data'");
  }
?>
