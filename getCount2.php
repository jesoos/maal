<?php // getCount2.php
require_once 'functions.php';
echo selectValue('count(w.id)',
                 'words w JOIN texts t ON w.id = t.word AND w.user<>t.user',
                 "t.i=0 AND w.word<>'?'");
?>
