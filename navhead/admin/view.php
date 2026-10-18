<?php if (!defined('NH_ROOT')) { http_response_code(404); exit; } ?>
<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Navigační lišta Metrobusu</title>
<link rel="stylesheet" href="../fonts/montserrat.css">
<link rel="stylesheet" href="./admin.css?v=7b6c82fcf65c">
<script type="module" src="./admin.js?v=693c7849ea5a"></script>
<meta name="navhead-api" content="./api.php">
</head>
<body>
<section class="preview-shell" aria-label="Živý náhled">
  <div class="preview-stage desktop" id="preview"><metrobus-nav id="live" active="sotofoto" manual-config></metrobus-nav></div>
  <div class="preview-tools"><strong>Náhled</strong><div class="segments" aria-label="Šířka náhledu"><button type="button" data-size="desktop" aria-pressed="true">Desktop</button><button type="button" data-size="tablet" aria-pressed="false">Tablet</button><button type="button" data-size="mobile" aria-pressed="false">Mobil</button><button type="button" id="togglePreview" aria-expanded="true">Skrýt</button></div></div>
</section>
<header class="page-head"><h1>Navigační lišta Metrobusu</h1><div class="head-actions"><div><button class="button" id="saveDraft" type="button">Uložit draft</button><button class="button" id="exportConfig" type="button">Stáhnout zálohu</button><button class="button primary" id="publishConfig" type="button">Publikovat</button></div></div></header>
<div class="workspace">
  <div class="workspace-bar"><nav class="tabs" aria-label="Sekce administrace"><button type="button" data-tab="navigation" aria-current="page">Navigace</button><button type="button" data-tab="announcements">Oznámení</button></nav><span id="draftStatus" role="status">Načítání…</span></div>
  <main>
    <section id="navigation" class="tab-panel" aria-label="Navigace"><div class="section-actions"><button type="button" class="button" id="addLink">+ Odkaz</button><button type="button" class="button" id="addGroup">+ Skupina</button></div><div id="menu" class="nav-tree"></div></section>
    <section id="announcements" class="tab-panel" aria-label="Oznámení" hidden><div class="section-actions"><button type="button" class="button" id="addAnnouncement">+ Oznámení</button></div><div id="announcementsList" class="list"></div></section>
  </main>
</div>
<div class="toast" id="toast" role="status" hidden></div>
</body>
</html>
