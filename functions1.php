<?php // functions1.php
require_once 'functions.php';

function getNickId($nick) {
  return selectValue('id', 'users', "nick='".escapeString($nick)."'");
}

function getSureId($id, $sure) {
  if ($sure) {
    $sure = escapeString($sure);
    $row = selectRow('id,pass,rank', 'users', "nick='$sure'");
    return $row && $row[1] && ($id == $row[0] || 0 < $row[2])? $row[0]: '0';
  }
  return selectValue('pass', 'users', "id=$id")? $id: '0';
}

function setNickSure($nick, $sure, $id) {
  $set = '';
  if ($nick) {
    $nick = escapeString($nick);
    if (selectValue('id', 'users', "nick='$nick'")) die('4');  // 아이디 에러
    $set = "nick='$nick'";
  }
  if ($sure) {
    $sure = escapeString($sure);
    $row  = selectRow('id,rank', 'users', "nick='$sure'");
    if (!$row || $row[1] < 1) die('8');  // 보증인 아이디 에러
    $sid = $row[0];
    $set = cat($set, 'sure='.($sid == $id? 'NULL': "$sid,rank=0"));
  }
  return $set;
}

function getMailUser($mail) {
  $mail = escapeString(mess($mail));
  return selectValue('id', 'users', "mail='$mail' LIMIT 1");
}

function isQuittable($id) {
  $row = selectRow('rank,sure', 'users', "id=$id");
  // 내가 다른 사람의 보증인이면 탈퇴할 수 없다
  if (!$row || 0 < selectValue('count(*)', 'users', "sure=$id")) return false;
  // 다른 사람이 내 보증인이면 탈퇴할 수 있다
  if ($row[0] == '1' && $row[1]) return true;
  // 내가 쓴 글이 없으면 탈퇴할 수 있다
  return selectValue('count(*)', 'words', "user=$id") == 0 &&
         selectValue('count(*)', 'texts', "user=$id") == 0;
}
?>
