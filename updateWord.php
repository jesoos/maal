<?php // updateWord.php
  require_once 'functions.php';

  if (isset($_POST['word'])) {
    $word = escapeString($_POST['word']);
    selectValue('id', 'words', "word='$word'") and die('2');
    isset($_POST['wid']) or die('3');
    echo sqlUpdate('words', "word='$word'", 'id='.$_POST['wid']);
  }
?>
