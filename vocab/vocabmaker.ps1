# If file is an arg
#$File = $args[0]
#$Text = ($args | Select-Object -Skip 1) -join ' '

# Hardcoded file
$File = "S:\bradmartin333.github.io\paco-juego\vocab\cien-años-de-soledad.md"
$Text = $args -join ' '

if ($Text.Contains('-u')) {
    $a = (Get-Content $File | Measure-Object)
    (Get-Content $File) | ? {($a.count)-notcontains $_.ReadCount} | Set-Content $File
    return
}

$Verb = $Text.Contains('-v')
if ($Verb) {
    $Text = $Text.Replace('-v','').Replace(' ','')
}

$Translation = New-Object System.Collections.Generic.List[System.Object]
$Uri = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=$Text"
$RawResponse = (Invoke-WebRequest -Uri $Uri -Method Get).Content

if ($Verb) {
    Add-Content $File ("[{0}](https://www.spanishdict.com/conjugate/{0}) - {1}  " -f $Text, $RawResponse.Split('"')[1])
}
else {
    Add-Content $File ("{0} - {1}  " -f $Text, $RawResponse.Split('"')[1])
}
