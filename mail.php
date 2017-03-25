<?php // mail.php
require_once 'functions.php';
require_once '../vendor/phpmailer/phpmailer/PHPMailerAutoload.php';

function sendMail0($to, $toa, $isHtml, $subject, $body, $re, $rea) {
  $mail = new PHPMailer;
  //$mail->SMTPDebug = 3;
  $mail->CharSet = 'UTF-8';
  $mail->Host = 'smtp.gmail.com';
  $mail->Port = 587;
  $mail->isSMTP();
  $mail->SMTPSecure = 'tls';
  $mail->SMTPAuth = true;
  $mail->Username = 'maljib.org';
  $mail->Password = 'rlatjddms';

  $maljib  = '배달말집';
  $maljiba = 'maljib.org@gmail.com';
  $mail->setFrom($maljiba, $maljib);
  if (is_array($to)) {
    foreach ($to as $i => $name) {
      $mail->addAddress($toa[$i], $name);
    }
  } else {
    $mail->addAddress($toa, $to);
  }
  if ($re) {
    $mail->addReplyTo($rea, $re);
    $mail->addBCC($rea, $re);
  } else {
    $mail->addReplyTo($maljiba, $maljib);
  }
  //$mail->addCC('maljib.org@gmail.com');
  //$mail->addAttachment('/Applications/XAMPP/htdocs/maal/0/01.png');
  $mail->isHTML($isHtml);
  $mail->Subject = $subject;
  $mail->Body    = $body;
  $mail->send() or die("전자우편을 보낼 수 없습니다.");
}

function sendMail($to, $toa, $subject, $text, $re = false, $rea = false) {
  sendMail0($to, $toa, preg_match('/^.*<html.*<\/html>\s*$/s', $text), $subject, $text, $re, $rea);
}
/*
function sendMail($to, $subject, $text) {
  $fp = fopen('mail'.substr(microtime(),1,7).'.txt', 'w');
  fwrite($fp, "$to\n$subject\n\n$text");
  fclose($fp);
}

function sendMail0($to, $subject, $what, $text) {
  if ($what == 'html') {
    $fp = fopen('mail'.substr(microtime(),1,7).'.html', 'w');
    fwrite($fp, "$text");
    fclose($fp);
  } else {
    sendMail($to, $subject, $text);
  }
}
*/
function sendMail4($nick, $mail, $subject, $text) {
  if (!$mail) {
    $mail = mess(selectValue('mail', 'users', "nick='".escapeString($nick)."'"))
          or die("아이디($nick)가 없습니다.");
  }
  sendMail($nick, $mail, $subject, "$nick 님께,\n\n$text");
}

function sendMail3($id, $subject, $text) {
  $row = selectRow('nick,mail', 'users', "id=$id") or die("사용자 번호($id)가 없습니다.");
  sendMail4($row[0], mess($row[1]), $subject, $text);
}

function sendToMaster($subject, $text) {
  $row = selectRow('nick,mail', 'users u JOIN master m ON u.id = m.user', '1')
            or die("관리자가 없습니다.");
  sendMail4($row[0], mess($row[1]), $subject, $text);
}
?>
