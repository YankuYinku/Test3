$prevPwd = $PWD; Set-Location -ErrorAction Stop -LiteralPath $PSScriptRoot

kubectl kustomize ./overlays/feature
kubectl apply -k ./overlays/feature

kubectl rollout restart deployment/apps-faq

$prevPwd | Set-Location