<?php

require_once(__DIR__ . '/vendor/autoload.php');

header('Content-Type: application/json');

$dayToMarks = [];
$today = date('Y-m-d');
$day_plus_30 = new DateTime($today);
$day_plus_30->add(new DateInterval('P30D'));

function getLeadsWithStatuses($api, $offset) {
  global $dayToMarks, $today, $day_plus_30;

  $chunkSize = 100;
  $r1 = $api->lead->getAll([], [41493883, 142], [], "", $chunkSize, $offset);

  if ($r1['count'] === $chunkSize) {
    getLeadsWithStatuses($api, $offset + $chunkSize);
  }

  foreach ($r1['result'] as $info) {
    foreach ($info['custom_fields'] as $customField) {
      if ($customField['id'] === 1518925) {
        $date = $customField['values'][0]['value'];
        if ($date >= $today && $date <= $day_plus_30->format('Y-m-d')) {
          if (!isset($dayToMarks[$date])) {
            $dayToMarks[$date] = 0;
          }
          $dayToMarks[$date] += 1;
        }
      }
    }
  }
}

Introvert\Configuration::getDefaultConfiguration()->setHost('https://a......rm.ru/tmp');
Introvert\Configuration::getDefaultConfiguration()->setApiKey('key', '23bc075b710da......9e889aed');

$api = new Introvert\ApiClient();

try {
  getLeadsWithStatuses($api, 0);

  echo json_encode($dayToMarks);

} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
  // echo $e->getMessage() . PHP_EOL;
}
