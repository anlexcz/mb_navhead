<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
nh_session(); nh_auth();
header('Content-Type: text/html; charset=utf-8');
require __DIR__.'/view.php';
