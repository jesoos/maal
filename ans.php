<?php // ans.php
  require_once 'functions.php';

  if (selectValue('user', 'master', '1') == $_POST['id']) {
    $rows = selectRows(
"a.id,u.id,convert_tz(a.t,'+00:00','+09:00'),nick,name,phone,u.mail,a.mail",
'asks a JOIN users u ON a.user = u.id', '1 ORDER BY t');
    forEach ($rows as &$a) {
      $a = array($a[0].'_'.$a[1], substr($a[2], 2, 14),
                 $a[3].' '.$a[4], mess($a[5]), mess($a[6]), mess($a[7]));
    }
    echo json_encode($rows);
  } else {
    echo '[]';
  }
?>
