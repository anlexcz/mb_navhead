<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
nh_session();
if ($_SERVER['REQUEST_METHOD']!=='POST') nh_fail(405,'Nepovolená metoda.');
if (!hash_equals($_SESSION['csrf'],$_SERVER['HTTP_X_NAVHEAD_CSRF'] ?? '')) nh_fail(403,'Obnov stránku a zkus to znovu.');
$_SESSION=[];
$params=session_get_cookie_params();
setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>$params['path'],'domain'=>$params['domain'],'secure'=>$params['secure'],'httponly'=>$params['httponly'],'samesite'=>$params['samesite']]);
session_destroy();
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['logged_out'=>true]);
