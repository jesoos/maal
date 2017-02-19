<?php // isQuittable.php
require_once 'functions.php';

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
