<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
nh_session();
$settings=nh_settings();
if (empty($settings['password_hash'])) nh_fail(503,'Nejdřív otevři admin/setup.php.');
if (nh_authenticated(false)) { header('Location: ./',true,303); exit; }
$error=isset($_GET['expired']) ? 'Přihlášení vypršelo. Přihlas se znovu.' : '';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!hash_equals($_SESSION['csrf'],$_POST['csrf'] ?? '')) { http_response_code(403); $error='Obnov stránku a zkus to znovu.'; }
    else {
        $password=$_POST['password'] ?? ''; $user=$_POST['username'] ?? '';
        $valid=is_string($password) && strlen($password)<=1024 && password_verify($password,$settings['password_hash']);
        if ($valid && $user==='admin') {
            session_regenerate_id(true);
            $_SESSION=['auth_user'=>'admin','last_activity'=>time(),'password_stamp'=>hash('sha256',$settings['password_hash']),'csrf'=>bin2hex(random_bytes(32))];
            header('Location: ./',true,303); exit;
        }
        http_response_code(401); $error='Nesprávné jméno nebo heslo.';
    }
} elseif ($_SERVER['REQUEST_METHOD']!=='GET') nh_fail(405,'Nepovolená metoda.');
header('Content-Type: text/html; charset=utf-8');
$template=file_get_contents(__DIR__.'/login-view.php');
$template=substr($template,strpos($template,'<!doctype html>'));
echo str_replace(['{{CSRF}}','{{ERROR}}','{{DEMO_NOTE}}'],[nh_escape($_SESSION['csrf']),nh_escape($error),''],$template);
