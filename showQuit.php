<?php // showQuit.php
require_once 'functions1.php';
echo isQuittable($_POST['id'])? '1': '0';
?>
