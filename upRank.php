<?php // upRank.php
require_once 'mail.php';

$id   = getPost('id');
$nick = getPost('nick');
if ($id && $nick) {
  echo sqlUpdate('users', 'rank=1', "id=$id");
  sendMail3($id, '보증 승낙', $nick.' 님이 보증했습니다.');
}
?>
