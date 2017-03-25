<?php // deleteData.php
  require_once 'functions.php';

  if (isset($_POST['a'])) {
    $a  = explode(',', $_POST['a']);
    $rc = sqlDelete('texts', "id=$a[0]");
    if ($rc == 1 && count($a) === 2) {
      $rc = sqlDelete('words',
             "id=$a[1] AND NOT EXISTS (SELECT id FROM texts WHERE word=$a[1])");
    }
    echo $rc;  // 반환 값이 1이면 정상이다
  }
?>
