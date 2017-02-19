<?php // updateMail.php
  require_once 'functions.php';

  if (isset($_GET['i'])) {
    $i   = $_GET['i'];
    $row = selectRow('user,data', 'etc', "id=$i") or die('앞서 확인하셨습니다.');
    sqlDelete('etc', "id=$i") or die('etc 데이터를 지울 수 없습니다.');
    if (count($row) === 2) {
      $mail = escapeString(mess($row[1]));
      sqlUpdate('users', "mail='$mail'", "id=$row[0]") or die('Update error.');
      echo "전자우편 주소가 ".$row[1]."으로 바뀌었습니다.";
    }
  }  
?>
