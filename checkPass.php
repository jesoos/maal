<?php // checkPass.php  -- 비밀번호 검사
  require_once 'functions.php';
  $pass = selectValue('pass', 'users', 'id='.getPost('id')) or die('1'); // 없음
  echo checkPass(getPost('pass'), $pass)? "0": "2";                // 맞음: 틀림
?>
