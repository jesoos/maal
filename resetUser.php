<?php // resetUser.php
  require_once 'mail.php';

  if (isset($_POST['id'])) {
    $a = explode('_', $_POST['id']);
    $yes = $a[0] == '0';
    if ($yes) {
      sqlUpdate('users', 'rank=0', 'id='.$a[2]) == 1 or die('업데이트 실패');
    }
    $nick = selectValue('nick', 'users', 'id='.$a[2]);
    $mail = mess(selectValue('mail', 'asks', 'id='.$a[1]));
    sqlDelete('asks', 'id='.$a[1]) or die('메일 점검 요청 삭제 실패.');
    sendMail4($nick, $mail, '전자우편 살핌',
              $yes? '전자우편 주소를 바로잡고 다시 해보십시오.':
                 $nick.'은 다른 사람의 아이디인 것 같습니다.');
  }
?>
