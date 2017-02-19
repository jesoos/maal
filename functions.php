<?php // functions.php

$dbhost  = 'localhost';
$dbuser  = 'scott';
$dbpass  = 'tiger';
$dbname  = 'wordlist';

$connection = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
$connection->connect_error and die($connection->connect_error);

function myOpen() {
  global $connection;
  $connection = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
  $connection->connect_error and die($connection->connect_error);
  return $connection;
}

function myClose() {
  global $connection;
  $connection->close();
}

// Sql을 실행한다
function sql($query) {
  global $connection;
  $result = $connection->query($query) or die($connection->error);
  return $result;
}

function selectRows($select, $from, $where) {
  $result = sql("SELECT $select FROM $from WHERE $where");
  for ($rows = array(); $row = $result->fetch_row(); $rows[] = $row);
  $result->close();
  return $rows;
}

function selectValues($select, $from, $where) {
  $result = sql("SELECT $select FROM $from WHERE $where");
  for ($values = array(); $row = $result->fetch_row(); $values[] = $row[0]);
  $result->close();
  return $values;
}

function selectRow($select, $from, $where) {
  $result = sql("SELECT $select FROM $from WHERE $where");
  $row = $result->fetch_row();
  $result->close();
  return $row;
}

function selectValue($select, $from, $where) {
  $row = selectRow($select, $from, $where);
  return $row? $row[0]: '';
}

function sqlInsert($table, $columns, $values) {
  global $connection;
  $connection->query("INSERT INTO $table($columns) VALUES($values)")
              or die($connection->error);
  return $connection->insert_id;
}

function sqlUpdate($table, $set, $where) {
  global $connection;
  $connection->query("UPDATE $table SET $set WHERE $where")
              or die($connection->error);
  return $connection->affected_rows;
}

function sqlDelete($table, $where) {
  global $connection;
  $connection->query("DELETE FROM $table WHERE $where")
              or die($connection->error);
  return $connection->affected_rows;
}

// 특수 글자 등을 escape 처리하여 ASCII 글자열로 변환한다
function escapeString($string) {
  global $connection;
  return $connection->escape_string($string);
}

function cat($a, $b) {
  return $a && $b? $a.','.$b: $a.$b;
}

function getPost($index) {
  return isset($_POST[$index])? $_POST[$index]: '';
}

// 비밀번호의 해시 값을 구한다 (비밀번호)
function getHash($password) {
  $salt = mcrypt_create_iv(16, MCRYPT_DEV_URANDOM);
  return hash_pbkdf2("sha256", $password, $salt, 1000, 16, true).$salt;
}

// 비밀번호의 해시 값을 검사한다 (비밀번호, 해시 값)
function checkPass($password, $hash) {
  return hash_pbkdf2("sha256", $password, substr($hash, 16), 1000, 16, true)
         === substr($hash, 0, 16);
}

function mess($s) {
  if ($s && is_string($s)) {
    $a = str_split($s);
    foreach ($a as $i=>&$c) {
      $o = ord($c);
      if (0x20 <= $o && $o <= 0x7f) {
        $c = chr($o ^ ($i % 29 + 2));
      }
    }
    return join($a);
  }
  return $s;
}
?>
