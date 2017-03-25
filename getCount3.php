<?php // getCount3.php
require_once 'functions.php';
echo selectValue('count(DISTINCT w.id)',
                 'words w JOIN texts t ON w.id = t.word',
                 "t.i=1 AND w.word<>'?'");
?>
