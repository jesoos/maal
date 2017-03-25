<?php // confirmMail.php
  require_once 'functions1.php';
  require_once 'mail.php';

  if (isset($_POST['mail'])) {
    $id   = getPost('id');
    $nick = getPost('nick'); 
    $name = getPost('name'); 
    $mail = $_POST['mail']; 
    $sure = getPost('sure');
    $next = 'index1';
    if ($id && $id{0} == '-') {
      $id   = -((int) $id);
      $data = $nick;
      $msg  = '비밀번호를 바꾸';
    } else {
      getMailUser($mail) and die('16');
      if ($id) {
        $next = 'updateMail';
        $data = $mail;
        $msg  = '이 전자우편 주소를 쓰';
      } else {
        setNickSure($nick, $sure, '');
        $id   = '0';
        $data = "$nick $name $mail $sure";
        $msg  = '가입하';
      }
    }
    $data = escapeString($data);
    $i = sqlInsert('etc', 'user,data', "$id,'$data'") or die('etc 데이터 기록 에러');
    $host = $_SERVER['SERVER_NAME'];
    $text = <<<END_OF_TEXT
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
a { text-decoration:none; background-color:#efefef;
    border:1px solid #aaaaaa; border-radius:5px; padding: 0 2px; }
  </style>
</head>
<body>
$nick 님께,<br><br>배달말집입니다.<br>${msg}시려면
<a href="http://$host/maal/$next.php?i=$i">확인</a>을 누르십시오.
</body>
</html>
END_OF_TEXT;
    sendMail0($nick, $mail, true, '전자우편 주소 확인', $text, false, false);
    echo $id == '0'? 'c': '0';
  }
?>
