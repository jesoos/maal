<?php // getNickIdSureId.php
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
?>
