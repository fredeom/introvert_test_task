<?php

require_once(__DIR__ . '/vendor/autoload.php');

function getClients() {
  return [
      [
          "id" => 1,
          "name" => "intrdev",
          "api" => "23bc075b71.....0ff9e889aed"
      ],
      [
          "id" => 2,
          "name" => "artedegrass0",
          "api" => "",
      ],
  ];
}

function getCompleteLeadsTotal($api, $offset, $date_from, $date_to) {
  $chunkSize = 50;
  $r1 = $api->lead->getAll([], [142], [], "", $chunkSize, $offset);
  $sum = 0;
  if ($r1['count'] === $chunkSize) {
    $sum = getCompleteLeadsTotal($api, $offset + $chunkSize, $date_from, $date_to);
  }
  foreach ($r1['result'] as $info) {
    if ($info['date_close'] >= $date_from && $info['date_close'] <= $date_to) {
      $sum += $info['price'];
    }
  }
  return $sum;
}

if (!isset($_GET['date_from']) || !isset($_GET['date_to'])) {

  ?>
  Please, add query parameters to url like localhost?date_from=0&date_to=1633329465253<br><br>
  <form method='get'>
    <label>Date from <input type='date' onchange='changeDateFrom(this.value)'/></label><br><br>
    <label>Date to <input type='date' onchange='changeDateTo(this.value)'/></label><br><br>
    <input type='hidden' name='date_from' />
    <input type='hidden' name='date_to' />
    <input type='submit' />
  </form>
  <script>
    function changeDateFrom(value) {
      document.forms[0].date_from.value = Math.floor((new Date(value)).getTime() / 1000);
    }
    function changeDateTo(value) {
      document.forms[0].date_to.value = Math.floor((new Date(value)).getTime() / 1000);
    }
  </script>
  <?php

  die;
}

$date_from = $_GET['date_from'];
$date_to = $_GET['date_to'];

Introvert\Configuration::getDefaultConfiguration()->setHost('https://a...rm.ru/tmp');
//Introvert\Configuration::getDefaultConfiguration()->setApiKey('key', '23bc075b710da43....889aed');

$api = new Introvert\ApiClient();

echo "<table border=1>";
echo "<thead><tr><th>Client ID</th><th>Client Name</th><th>Budget</th></tr></thead>";
echo "<tbody>";
$total = 0;
foreach (getClients() as $info) {
  Introvert\Configuration::getDefaultConfiguration()->setApiKey('key', $info['api']);
  $result = NULL;
  $error = NULL;
  try {
    $result = $api->account->info();
  } catch (Exception $e) {
    $error = $e->getMessage();
  }
  if (isset($result['code']) && $result['code'] === 1) {
    $budget = getCompleteLeadsTotal($api, 0, $date_from, $date_to);
    echo "<tr><td>" . $info['id'] . "</td><td>" . $info['name'] . "</td><td>" . $budget . "</td></tr>";
    $total += $budget;
  } else {
    echo "<tr><td>" . $info['id'] . "</td><td>" . $info['name'] . "</td><td>" . $error . "</td></tr>";
  }
}
echo "<tr><th>Total</th><td></td><td>" . $total . "</td></tr>";
echo "</tbody>";
echo "</table>";
