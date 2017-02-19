<?php // showQuit.php
require_once 'isQuittable.php';
echo isQuittable($_POST['id'])? '1': '0';
?>
