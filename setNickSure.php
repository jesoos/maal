<?php // setNickSure.php
  require_once 'functions.php';

function setNickSure($nick, $sure, $id) {
  $set = '';
  if ($nick) {
    $nick = escapeString($nick);
    if (selectValue('id', 'users', "nick='$nick'")) die("4");  // 아이디 에러
    $set = "nick='$nick'";
  }
  if ($sure) {
    $sure = escapeString($sure);
    $row  = selectRow('id,rank', 'users', "nick='$sure'");
    if (!$row || $row[1] < 1) die("8");  // 보증인 아이디 에러
    $sid = $row[0];
    $set = cat($set, 'sure='.($sid == $id? 'NULL': "$sid,rank=0"));
  }
  return $set;
}
?>
