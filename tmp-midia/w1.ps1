[Console]::OutputEncoding=[Text.Encoding]::UTF8
$ErrorActionPreference='Stop'
$base='https://raw.githubusercontent.com/carvalhojoaopedro31/apolice-seg-site/claude/project-thread-c9d7fp/tmp-midia/'
$tmp=Join-Path $env:TEMP 'w1'; New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$b='G:\Meu Drive'
function Dest($date,$hora,$tipo){
  $r=Get-ChildItem -LiteralPath $b -Directory -Filter 'SEMANA*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter ($date+'*') } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -Filter ($hora+' - '+$tipo+'*') }
  if(@($r).Count -ne 1){ throw "destino $date $hora $tipo : $(@($r).Count)" }
  return $r[0].FullName
}
function Get($f){ iwr ($base+$f) -OutFile (Join-Path $tmp $f) -UseBasicParsing; return (Join-Path $tmp $f) }
foreach($d in '01','02','03','04','05','06','07'){
  $dest=Dest "2026-12-$d" '20h00' 'Story'
  Copy-Item -Force (Get "W_S$d.png") (Join-Path $dest '01.png')
  $old=Join-Path $dest '01.jpg'; if(Test-Path -LiteralPath $old){ Remove-Item -LiteralPath $old; "lixeira: 01.jpg ($d)" }
  "OK story $d"
}
$fd=@{'02'=7;'05'=4}
foreach($d in $fd.Keys){
  $dest=Dest "2026-12-$d" '12h00' 'Feed'
  for($i=1;$i -le $fd[$d];$i++){ Copy-Item -Force (Get "W_F$d`_$i.png") (Join-Path $dest ('{0:D2}.png' -f $i)) }
  "OK feed $d -> $dest"
  Get-ChildItem -LiteralPath $dest | ForEach-Object { $_.Name }
}
