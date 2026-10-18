<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
nh_session(); nh_auth();
header('Content-Type: text/html; charset=utf-8');
$template=file_get_contents(NH_ROOT.'/v2/admin.html');
$template=str_replace(['href="./admin.css','src="./admin.js'],['href="../v2/admin.css','src="../v2/admin.js'],$template);
$template=str_replace('</head>','<meta name="navhead-api" content="./api.php"></head>',$template);
$template=str_replace('class="button primary" id="exportConfig"','class="button" id="exportConfig"',$template);
$template=str_replace('</div><small>Stažení změny nepublikuje.</small>','<button class="button primary" type="button" id="publishConfig">Publikovat</button></div>',$template);
echo $template;
