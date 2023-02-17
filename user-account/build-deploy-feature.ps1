param (
    [Parameter(Position = 0)]
    [string] $PAT 
)

if(!$PAT) {
    Write-Output('Build and deployment skipped. You must provide a token.')
} else {
    $prevPwd = $PWD; Set-Location -ErrorAction Stop -LiteralPath $PSScriptRoot

    ./build.ps1 $PAT
    ./kubernetes/deploy-feature.ps1
    
    $prevPwd | Set-Location
}


