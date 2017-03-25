<?php // deleteUser.php
  require_once 'mail.php';
  require_once 'functions1.php';

  if (isset($_POST['id'])) {
    $a = explode(',', $_POST['id']);
    if (isset($_POST['nick'])) {
      $o = count($a) === 2? "탈퇴": "보증";
      $s = count($a) === 2? "를": "을";
      $v = count($a) === 2 && $a[1] != "0"? " 승낙": " 거절";
      sendMail3($a[0], $o.$v, $_POST['nick']." 님이 $o$s${v}했습니다.");
    }
    if (count($a) === 2) {
      if ($a[1] == '0') {
        echo sqlUpdate('users', 'rank=1', "id=$a[0]");  // 탈퇴 거절
      } else {
        sqlUpdate('words', "user=$a[1]",     "user=$a[0]");
        sqlUpdate('texts', "user=$a[1],t=t", "user=$a[0]");
        echo sqlDelete('users', "id=$a[0]");            // 탈퇴 승낙
      }
    } else if (count($a) === 3) {
      if (0 < selectValue('count(*)', 'words', "user=$a[0]") ||
          0 < selectValue('count(*)', 'texts', "user=$a[0]")) {
        echo '2';                // 내 글이 있으면 보증인의 승락이 맀어야 탈퇴할 수 맀다
      } else { 
        echo sqlDelete('users', "id=$a[0]");  // 내 글이 없으면 내 아이디를 없앤다
      }
    } else {
      if (isQuittable($a[0])) {
        echo sqlDelete('users', "id=$a[0]");
      } else {
        echo sqlUpdate('users', "rank=1,sure=NULL", "id=$a[0]");
      }
    }
  }
?>
