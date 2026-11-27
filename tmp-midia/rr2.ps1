[Console]::OutputEncoding=[Text.Encoding]::UTF8
$ErrorActionPreference='Stop'
$base='https://raw.githubusercontent.com/carvalhojoaopedro31/apolice-seg-site/claude/project-thread-c9d7fp/tmp-midia/'
$tmp=Join-Path $env:TEMP 'rr'; New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$b='G:\Meu Drive'
function Dest($date,$hora,$tipo){
  $r=Get-ChildItem -LiteralPath $b -Directory -Filter 'SEMANA*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter ($date+'*') } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter ($hora+' - '+$tipo+'*') }
  if(@($r).Count -ne 1){ throw "destino $date $hora $tipo : $(@($r).Count)" }
  return $r[0].FullName
}
function Get($f){ iwr ($base+$f) -OutFile (Join-Path $tmp $f) -UseBasicParsing; return (Join-Path $tmp $f) }
# 26/12: pasta combinada Post + Story
$r=Get-ChildItem -LiteralPath $b -Directory -Filter 'SEMANA*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter '2026-12-26*' } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory }
$d26=$r[0].FullName; "26/12 pasta: $d26"; Get-ChildItem -LiteralPath $d26 | ForEach-Object { $_.Name }
Copy-Item -Force (Get "R_S261226.png") (Join-Path $d26 '01-story.png'); "OK story 26/12"
$stories=@('261228','261229','270103','270104','270105','270107','270110','270111')
foreach($t in $stories){
  $date = if($t.StartsWith('2612')){ '2026-12-'+$t.Substring(4) } else { '2027-01-'+$t.Substring(4) }
  $dest=Dest $date '20h00' 'Story'
  Copy-Item -Force (Get "R_S$t.png") (Join-Path $dest '01.png')
  Copy-Item -Force (Get "R_L$t.txt") (Join-Path $dest 'LEGENDA.txt')
  $old=Join-Path $dest '01.jpg'; if(Test-Path -LiteralPath $old){ Remove-Item -LiteralPath $old; "lixeira 01.jpg $date" }
  "OK story $date"
}
$feeds=@{'20261209'=6;'20261212'=7;'20261216'=5;'20270102'=6}
foreach($k in $feeds.Keys){
  $date = $k.Substring(0,4)+'-'+$k.Substring(4,2)+'-'+$k.Substring(6,2)
  $dest=Dest $date '12h00' 'Feed'
  for($i=1;$i -le $feeds[$k];$i++){ Copy-Item -Force (Get "R_F$k`_$i.png") (Join-Path $dest ('{0:D2}.png' -f $i)) }
  "OK feed $date"
}
