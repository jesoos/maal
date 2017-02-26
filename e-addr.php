<!doctype html>
<html lamg="ko">
<head>
 <meta charset="utf-8">
 <title>주소</title>
 <style>td:nth-child(4n+1),td:nth-child(4n+4) { text-align:right; }</style>
</head>
<body>
<table>
<?php // a.php
require_once 'functions.php';
$a = selectRows('nick,name,rank,mail', 'users', '1 ORDER BY name');
forEach ($a as $row) {
  echo "<tr><td>".$row[0]."<td>".$row[1]."<td>".$row[2]."<td>".mess($row[3]);
}
?>
</table>
</body>
</html>
