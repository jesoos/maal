<?php // getUser.php
  require_once 'functions.php';
  $nick = getPost('nick');
  $column = 'nick';
  if (preg_match('/@\w+\./', $nick)) {
    $nick = mess($nick);
    $column = 'mail';
  }
  $row  = selectRow('u.id,u.name,u.mail,u.rank,s.nick,u.nick',
                    'users u LEFT OUTER JOIN users s ON u.sure = s.id', 
                    "u.$column='".escapeString($nick)."'")
             or die($column == 'mail'? '{"id":"0"}': '{}');
  if ($row[3] < 0) {
    sqlUpdate('users', 'rank=1', "id=$row[0]");
    $row[3] = '1';
  }
  echo json_encode(array('id'=>$row[0],'name'=>$row[1],'mail'=>mess($row[2]),
                         'rank'=>$row[3],'sure'=>($row[4]? $row[4]: $row[5]),
                         'nick'=>$row[5]));
?>
