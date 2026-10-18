<?php
declare(strict_types=1);
ini_set('display_errors','0');
define('NH_ROOT', dirname(__DIR__));
define('NH_PRIVATE', NH_ROOT . '/private');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function nh_fail(int $status, string $message): void { http_response_code($status); header('Content-Type: application/json; charset=utf-8'); echo json_encode(['error'=>$message], JSON_UNESCAPED_UNICODE); exit; }
function nh_settings(): array { $file=NH_PRIVATE.'/settings.php'; if (!is_file($file)) nh_fail(503,'Chybí instalační nastavení. Použij instalační balíček.'); return require $file; }
function nh_session(): void {
    $secure=(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off');
    $host=explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
    if (!$secure && !in_array($host,['localhost','127.0.0.1','::1'],true)) nh_fail(400,'Administraci otevři přes HTTPS.');
    session_name('navhead_'.substr(hash('sha256',NH_ROOT),0,12));
    session_set_cookie_params(['lifetime'=>0,'path'=>rtrim(dirname($_SERVER['SCRIPT_NAME']),'/').'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
    ini_set('session.use_strict_mode','1'); if (!@session_start()) nh_fail(503,'Hosting nemá funkční PHP sessions. Zkontroluj nastavení hostingu.');
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function nh_auth(): void {
    $settings=nh_settings(); if (empty($settings['password_hash'])) { http_response_code(503); echo 'Nejdřív otevři admin/setup.php.'; exit; }
    $user=$_SERVER['PHP_AUTH_USER'] ?? ''; $password=$_SERVER['PHP_AUTH_PW'] ?? '';
    $authorization=$_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$user && strncmp($authorization,'Basic ',6)===0) { $decoded=base64_decode(substr($authorization,6),true); if ($decoded!==false) { $parts=explode(':',$decoded,2); $user=$parts[0]; $password=$parts[1] ?? ''; } }
    if ($user!=='admin' || !password_verify($password,$settings['password_hash'])) { header('WWW-Authenticate: Basic realm="Metrobus admin", charset="UTF-8"'); nh_fail(401,'Přihlášení: admin a nastavené heslo.'); }
}
function nh_lock() { $handle=fopen(NH_PRIVATE.'/write-lock.php','c+'); if (!$handle || !flock($handle,LOCK_EX)) nh_fail(500,'Nelze uzamknout úložiště.'); return $handle; }
function nh_atomic(string $file,string $contents): void {
    $tmp=tempnam(dirname($file),'.navhead-'); if ($tmp===false) throw new RuntimeException('Nelze vytvořit dočasný soubor.');
    try { chmod($tmp,substr($file,-5)==='.json' ? 0644 : 0600); if (file_put_contents($tmp,$contents)!==strlen($contents) || !rename($tmp,$file)) throw new RuntimeException('Zápis se nezdařil.'); }
    finally { if (is_file($tmp)) unlink($tmp); }
    if (function_exists('opcache_invalidate') && substr($file,-4)==='.php') opcache_invalidate($file,true);
}
function nh_json(array $data): string { return json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR)."\n"; }
function nh_read_draft(): string { $file=NH_PRIVATE.'/draft.php'; return is_file($file) ? substr((string)file_get_contents($file),strlen("<?php exit; ?>\n")) : (string)file_get_contents(NH_ROOT.'/config.json'); }
function nh_state(): array { $draft=nh_read_draft(); $published=(string)file_get_contents(NH_ROOT.'/config.json'); return ['config'=>json_decode($draft,true,512,JSON_THROW_ON_ERROR),'draft_version'=>hash('sha256',$draft),'published_version'=>hash('sha256',$published),'csrf'=>$_SESSION['csrf']]; }
function nh_url(string $url): bool { return $url==='#' || (filter_var($url,FILTER_VALIDATE_URL)!==false && in_array(strtolower((string)parse_url($url,PHP_URL_SCHEME)),['http','https'],true)); }
function nh_html(string $html): string {
    if (!class_exists('DOMDocument')) throw new InvalidArgumentException('Hosting potřebuje PHP rozšíření DOM/XML.');
    $document=new DOMDocument(); $old=libxml_use_internal_errors(true); $document->loadHTML('<?xml encoding="UTF-8"><body>'.$html.'</body>',LIBXML_NONET); libxml_clear_errors(); libxml_use_internal_errors($old);
    $render=function($node) use (&$render): string {
        if ($node->nodeType===XML_TEXT_NODE) return htmlspecialchars($node->nodeValue,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
        if ($node->nodeType!==XML_ELEMENT_NODE) return '';
        $tag=strtolower($node->nodeName); if (in_array($tag,['script','style','iframe','object','svg','math','template'],true)) return '';
        $inside=''; foreach ($node->childNodes as $child) $inside.=$render($child);
        if ($tag==='br') return '<br>';
        if (in_array($tag,['strong','em','u'],true)) return '<'.$tag.'>'.$inside.'</'.$tag.'>';
        if ($tag==='a' && nh_url($node->getAttribute('href'))) return '<a href="'.htmlspecialchars($node->getAttribute('href'),ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'" target="_blank" rel="noopener noreferrer">'.$inside.'</a>';
        return $inside;
    };
    $body=$document->getElementsByTagName('body')->item(0); return $body ? $render($body) : '';
}
function nh_config($config): array {
    if (!is_array($config) || !is_array($config['navigation'] ?? null) || !is_array($config['announcements'] ?? null) || count($config['navigation'])>80 || count($config['announcements'])>50) throw new InvalidArgumentException('Neplatná konfigurace.');
    $keys=[]; $normalizeItems=function(array $items,int $depth=0) use (&$normalizeItems,&$keys): array {
        if (count($items)>80) throw new InvalidArgumentException('Příliš mnoho odkazů.'); $out=[];
        foreach ($items as $item) {
            if (!is_array($item) || !is_string($item['key'] ?? null) || !preg_match('/^[a-zA-Z0-9_-]{1,100}$/D',$item['key']) || isset($keys[$item['key']]) || !is_string($item['label'] ?? null) || trim($item['label'])==='' || strlen($item['label'])>500) throw new InvalidArgumentException('Zkontroluj názvy a identifikátory položek.');
            $keys[$item['key']]=true; $type=$item['type'] ?? '';
            if (!in_array($type,['link','group'],true) || ($depth && $type==='group')) throw new InvalidArgumentException('Skupiny nelze vnořovat.');
            $row=['key'=>$item['key'],'type'=>$type,'label'=>trim($item['label']),'enabled'=>($item['enabled'] ?? true)!==false];
            if ($type==='group') { if (!is_array($item['children'] ?? null)) throw new InvalidArgumentException('Neplatná skupina.'); $row['children']=$normalizeItems($item['children'],1); }
            else { $url=$item['url'] ?? ''; if (!is_string($url) || strlen($url)>2048 || !nh_url($url)) throw new InvalidArgumentException('Odkaz musí obsahovat platnou adresu https:// nebo http://.'); $row['url']=$url; $row['target']=($item['target'] ?? '_blank')==='_self' ? '_self' : '_blank'; }
            $out[]=$row;
        } return $out;
    };
    $result=['version'=>2,'navigation'=>$normalizeItems($config['navigation']),'announcements'=>[]];
    foreach ($config['announcements'] as $ann) {
        if (!is_array($ann) || !is_string($ann['html'] ?? null) || strlen($ann['html'])>20000) throw new InvalidArgumentException('Neplatné oznámení.');
        $row=['html'=>nh_html($ann['html']),'enabled'=>($ann['enabled'] ?? true)!==false];
        foreach (['visible_from','visible_to'] as $key) { $value=$ann[$key] ?? null; if ($value!==null && (!is_string($value) || strtotime($value)===false)) throw new InvalidArgumentException('Neplatné datum oznámení.'); $row[$key]=$value; }
        $result['announcements'][]=$row;
    } return $result;
}
