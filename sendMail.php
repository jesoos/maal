<?php // sendMail.php
require_once 'mail.php';

if (isset($_POST['id']) && isset($_POST['subj']) && isset($_POST['note'])) {
  $ids = explode(',', $_POST['id']);
  $to  = array();
  $toa = array();
  foreach ($ids as $id) {
    $row   = selectRow('nick,mail', 'users', "id=$id");
    $to[]  = $row[0];
    $toa[] = mess($row[1]);
  }
  if (count($to) < 1) die('메일 주소가 없습니다.');
  sendMail($to, $toa, $_POST['subj'], $_POST['note'], $_POST['re'], $_POST['rea']);
}
?>
