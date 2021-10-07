<?php

if (
  isset($_POST["name"]) &&
  isset($_POST["phone"]) &&
  isset($_POST["email"]) &&
  isset($_POST["comment"])
) {
  echo $_POST["name"] . " " . $_POST["phone"] . " " . $_POST["email"] . " " . $_POST["comment"];
  require_once('introvert_save.php');
}
