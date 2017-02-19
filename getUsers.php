<?php // getUsers.php
require_once 'functions.php';
echo json_encode(selectRows('u.nick, u.name, IFNULL(s.nick,u.nick), u.id',
                            'users u LEFT JOIN users s ON s.id = u.sure',
                            'u.rank=1 ORDER BY u.name, u.nick'));
?>
