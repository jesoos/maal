<?php // recent.php
  require_once 'functions.php';
  echo json_encode(selectValues('w.word', 'words w JOIN texts e ON w.id=e.word',
                                "w.word<>'?' ORDER BY e.t DESC LIMIT 500"));
?>
