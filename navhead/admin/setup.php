<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php'; nh_session();
$settings=nh_settings(); if (!empty($settings['password_hash'])) { http_response_code(404); exit; }
$error='';
$ready=PHP_VERSION_ID>=80000 && class_exists('DOMDocument') && is_writable(NH_PRIVATE) && is_writable(NH_ROOT);
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!$ready) $error='Hosting potřebuje PHP 8+, DOM/XML a právo zápisu do private a navhead.';
    elseif (!hash_equals($_SESSION['csrf'],$_POST['csrf'] ?? '') || empty($settings['install_token']) || !hash_equals($settings['install_token'],$_POST['token'] ?? '')) $error='Nesprávný instalační kód.';
    elseif (strlen($_POST['password'] ?? '')<12 || strlen($_POST['password'])>72 || $_POST['password']!==($_POST['confirm'] ?? '')) $error='Hesla se musí shodovat a mít 12 až 72 bajtů.';
    else {
        $lock=nh_lock();
        try { $current=nh_settings(); if (!empty($current['password_hash'])) throw new RuntimeException('Již nastaveno.');
            $content="<?php\nreturn ".var_export(['password_hash'=>password_hash($_POST['password'],PASSWORD_DEFAULT),'install_token'=>''],true).";\n";
            nh_atomic(NH_PRIVATE.'/settings.php',$content); session_regenerate_id(true); header('Location: ./'); exit;
        } catch (Throwable $exception) { $error='Nastavení nelze uložit.'; }
        finally { flock($lock,LOCK_UN); fclose($lock); }
    }
}
?>
<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nastavení navheadu</title><link rel="stylesheet" href="../fonts/montserrat.css"><link rel="stylesheet" href="./admin.css"><main style="max-width:560px;margin:40px auto;padding:20px"><h1>Navigační lišta Metrobusu</h1><p><?= $ready ? 'Hosting je připravený. Nastav heslo účtu admin.' : 'Chybí PHP 8+, DOM/XML nebo právo zápisu do private a navhead.' ?></p><p role="alert"><?= htmlspecialchars($error,ENT_QUOTES,'UTF-8') ?></p><form method="post"><input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf'],ENT_QUOTES,'UTF-8') ?>"><label class="field">Instalační kód<input type="password" name="token" required autocomplete="off"></label><br><label class="field">Heslo pro admin<input type="password" name="password" required minlength="12" autocomplete="new-password"></label><br><label class="field">Heslo znovu<input type="password" name="confirm" required minlength="12" autocomplete="new-password"></label><br><button class="button primary"<?= $ready ? '' : ' disabled' ?>>Nastavit heslo</button></form></main></html>
