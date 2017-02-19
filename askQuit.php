<?php // askQuit.php
  require_once 'mail.php';

  if (sqlUpdate('users', 'rank=-1', 'id='.$_POST['id'])) {
    sendMail4($_POST['sure'], '', '탈퇴 요청', $_POST['nick'].' 님이 탈퇴를 요청했습니다.');
  }
?>
