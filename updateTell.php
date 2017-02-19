<?php // updateTell.php
  require_once 'functions.php';

  isset($_POST['wid']) && isset($_POST['tell'])
  and (print sqlUpdate('words', 'tell='.$_POST['tell'], 'id='.$_POST['wid']));
?>
