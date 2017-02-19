<?php // search.php
  require_once 'functions.php';

  $j = ''; $w = ''; $d = '';
  if (isset($_POST['l'])) {
    $w = "w.word LIKE '%".escapeString($_POST['l'])."%' AND ";
  } else {
    if (isset($_POST['i'])) {
      $w = 'w.user = '.$_POST['i'].' AND ';
    } else if (isset($_POST['n'])) {
      $j = 'JOIN users u ON w.user = u.id '.
                       "AND u.nick = '".escapeString($_POST['n'])."'";
    } else if (isset($_POST['ei'])) {
      $j = 'JOIN texts e ON w.id = e.word AND w.user <> e.user AND e.i=0 '.
                                         'AND e.user = '.$_POST['ei'];
    } else if (isset($_POST['en'])) {
      $j = 'JOIN texts e ON w.id = e.word AND w.user <> e.user AND e.i=0 '.
           "JOIN users u ON u.id = e.user AND u.nick = '".
                               escapeString($_POST['en'])."'";
    } else if (isset($_POST['mi'])) {
      $j = 'JOIN texts m ON w.id = m.word AND m.i=1 AND m.user = '.$_POST['mi'];
    } else if (isset($_POST['mn'])) {
      $j = 'JOIN texts m ON w.id = m.word AND m.i=1 '.
           "JOIN users u ON u.id = m.user AND u.nick = '".
                               escapeString($_POST['mn'])."'";
    }
    if (isset($_POST['a'])) {
      $a = $_POST['a'];
      if ($a{0} === '-') {
        $d = ' DESC'; $a = substr($a, 1);
      }
      if ($a) {
        $w .= 'w.word '.($d? '<': '>')."= '".escapeString($a)."' AND ";
      }
    }
  }
  echo json_encode(selectValues('DISTINCT w.word', "words w $j",
                            "$w w.word <> '?' ORDER BY w.word$d LIMIT 1000"));
?>
