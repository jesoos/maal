<?php // updateUser.php
  require_once 'setNickSure.php';
  require_once 'mail.php';

  if (isset($_POST['id'])) {
    $id  = $_POST['id'];
    $set = setNickSure(getPost('nick'), getPost('sure'), $id);
    if (isset($_POST['name'])) {
      $set = cat($set, "name='".escapeString($_POST['name'])."'");
    }
    if ($set) {
      sqlUpdate('users', $set, "id=$id") or die('Update error.');
    }
    if (!$set || strpos($set, ',rank=0')) {
      $row = selectRow('sure,nick', 'users', "id=$id");
      sendMail3($row[0], '보증 요청', "$row[1] 님이 보증을 요청했습니다.");
      die('2');
    }
    echo '1';
  }
?>
