[Console]::OutputEncoding=[Text.Encoding]::UTF8
$ErrorActionPreference='Stop'
$base='https://raw.githubusercontent.com/carvalhojoaopedro31/apolice-seg-site/claude/project-thread-c9d7fp/tmp-midia/'
$tmp=Join-Path $env:TEMP 'up2511'; New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$b='G:\Meu Drive'
function Dest($date,$hora,$tipo){
  $r=Get-ChildItem -LiteralPath $b -Directory -Filter 'SEMANA*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter ($date+'*') } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter ($hora+' - '+$tipo+'*') }
  if(@($r).Count -ne 1){ throw "destino $date $hora $tipo : $(@($r).Count)" }
  return $r[0].FullName
}
function Get($f){ iwr ($base+$f) -OutFile (Join-Path $tmp $f) -UseBasicParsing; return (Join-Path $tmp $f) }
$st=@{'09'='';'19'='L19.txt';'22'='L22.txt';'23'='L23s.txt';'24'='L24.txt';'28'='L28.txt';'29'='L29.txt'}
foreach($d in $st.Keys){
  $dest=Dest "2026-12-$d" '20h00' 'Story'
  Copy-Item -Force (Get "S$d.png") (Join-Path $dest '01.png')
  if($st[$d]){ Copy-Item -Force (Get $st[$d]) (Join-Path $dest 'LEGENDA.txt') }
  "OK story $d -> $dest"
}
$fd=@{'09'=6;'23'=5}
foreach($d in $fd.Keys){
  $dest=Dest "2026-12-$d" '12h00' 'Feed'
  for($i=1;$i -le $fd[$d];$i++){ Copy-Item -Force (Get "F$d`_$i.png") (Join-Path $dest ('{0:D2}.png' -f $i)) }
  if($d -eq '23'){ Copy-Item -Force (Get 'L23.txt') (Join-Path $dest 'LEGENDA.txt') }
  "OK feed $d -> $dest"
  Get-ChildItem -LiteralPath $dest | Select-Object Name,Length,LastWriteTime | Format-Table | Out-String
}
