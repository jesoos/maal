<?php // getCount1.php
  require_once 'functions.php';
  echo selectValue('count(*)', 'words', '1') - 1;
?>
