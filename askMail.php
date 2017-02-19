<?php // askMail.php
  require_once 'mail.php';
  $id = getPost('id');
  $mail = escapeString(mess(getPost('a-mail')));
  $phone = escapeString(mess(getPost('phone')));
  sqlInsert('asks', 'user,mail,phone', "$id,'$mail','$phone'")
     or die('askMail.php: 문제 등록 안됨.');
  sendToMaster('전자우편 문제', '전자우편 못 받는 문제가 있습니다.');
?>
