<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
nh_session(); nh_auth(); header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD']==='GET') { echo nh_json(nh_state()); exit; }
if ($_SERVER['REQUEST_METHOD']!=='POST') nh_fail(405,'Nepovolená metoda.');
if (!hash_equals($_SESSION['csrf'],$_SERVER['HTTP_X_NAVHEAD_CSRF'] ?? '')) nh_fail(403,'Obnov stránku a zkus to znovu.');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>262144) nh_fail(413,'Konfigurace je příliš velká.');
$lock=nh_lock();
try {
    $input=json_decode(file_get_contents('php://input',false,null,0,262145),true,512,JSON_THROW_ON_ERROR); $state=nh_state();
    if (!is_array($input) || ($input['draft_version'] ?? '')!==$state['draft_version'] || ($input['published_version'] ?? '')!==$state['published_version']) nh_fail(409,'Na serveru jsou novější změny. Nejdřív si stáhni svou konfiguraci a obnov stránku.');
    if (($input['action'] ?? '')==='save') nh_atomic(NH_PRIVATE.'/draft.php',"<?php exit; ?>\n".nh_json(nh_config($input['config'] ?? null)));
    elseif (($input['action'] ?? '')==='publish') { $config=nh_config($state['config']); nh_atomic(NH_ROOT.'/v2/config.json',nh_json($config)); }
    else nh_fail(400,'Neznámá akce.');
    echo nh_json(nh_state());
} catch (InvalidArgumentException|JsonException $error) { nh_fail(422,$error->getMessage()); }
catch (Throwable $error) { nh_fail(500,'Nelze uložit soubory. Zkontroluj práva zápisu.'); }
finally { flock($lock,LOCK_UN); fclose($lock); }
