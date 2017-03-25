<?php // getData.php
  require_once 'functions.php';

  $a = array();
  if (isset($_POST['arg'])) {
    $arg   = explode(',', $_POST['arg']);
    $where = "word=$arg[0] AND i=".(count($arg) === 2? "0 AND e.id<>$arg[1]": '1');
    $rows  = selectRows("u.id,nick,e.id, convert_tz(t,'+00:00','+09:00'), data",
                        'texts e JOIN users u ON u.id=user',
                        $where.' ORDER BY t DESC');
    foreach ($rows as $row) {
      $a[] = array('uid'=>$row[0], 'nick'=>$row[1], 'id'=>$row[2],
                     't'=>substr($row[3], 0, 16), 'data'=>$row[4]);
    }
  }
  echo json_encode($a);
?>
