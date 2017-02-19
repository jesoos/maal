<?php
require 'vendor/autoload.php';
use Mailgun\Mailgun;

# Instantiate the client.
$mgClient = new Mailgun('key-484e97808a899c919b3d9d85e7ed5c67');
$domain = 'sandbox3cfb213e71e543448bcbe45d90b4ec22.mailgun.org';
$queryString = array(
    'begin'        => 'Mon, 1 May 2016 09:00:00 -0000',
    'ascending'    => 'yes',
    'limit'        =>  25,
    'pretty'       => 'yes',
    'subject'      => 'test'
);

$result = $mgClient->get("$domain/events", $queryString);
echo json_encode($result);
?>
