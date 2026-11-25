[Console]::OutputEncoding=[Text.Encoding]::UTF8
$b='G:\Meu Drive'
foreach($d in '2026-12-23 qua','2026-12-09 qua','2026-12-24 qui','2026-12-19 sab'){
  Get-ChildItem -LiteralPath $b -Directory -Filter 'SEMANA*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter $d | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory | ForEach-Object { "== " + $_.FullName; Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $_.FullName 'LEGENDA.txt') } } }
}
