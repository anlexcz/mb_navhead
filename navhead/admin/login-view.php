<?php if (!defined('NH_ROOT')) { http_response_code(404); exit; } ?>
<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="same-origin">
<title>Přihlášení · Správa navigace</title>
<link rel="stylesheet" href="../fonts/montserrat.css">
<link rel="stylesheet" href="./admin.css?v=63a8c8cc670e">
</head>
<body class="login-page">
<main class="login-card">
<h1>Správa navigace</h1>
<p class="login-error" id="loginError" role="alert">{{ERROR}}</p>
<form action="./login.php" method="post" id="loginForm">
<input type="hidden" name="csrf" value="{{CSRF}}">
<label class="field">Uživatel<input name="username" value="admin" required autocomplete="username" maxlength="100"></label>
<label class="field">Heslo<input name="password" type="password" required autocomplete="current-password" autofocus></label>
<button type="submit" class="button primary">Přihlásit</button>
</form>
</main>
</body>
</html>
