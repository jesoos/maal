<?php // getCount1a.php
  require_once 'functions.php';

  echo json_encode(selectRows('nick,count(words.id) count',
                     'words JOIN users ON user = users.id',
                     "word <> '?' GROUP BY user ORDER BY count DESC, nick"));
?>
