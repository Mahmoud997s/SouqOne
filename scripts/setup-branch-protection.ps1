$owner = 'Mahmoud997s'
$repo  = 'SouqOne'
$branch = 'main'

if (-not $env:GH_TOKEN) {
    Write-Host 'ERROR: GH_TOKEN not set.' -ForegroundColor Red
    exit 1
}

$headers = @{
    'Authorization' = "Bearer $($env:GH_TOKEN)"
    'Accept'        = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
}

$url = "https://api.github.com/repos/$owner/$repo/branches/$branch/protection"

$checkmark = [char]0x2713
$body = @{
    required_status_checks = @{
        strict   = $true
        contexts = @("CI $checkmark")
    }
    enforce_admins = $true
    required_pull_request_reviews = @{
        required_approving_review_count = 1
        dismiss_stale_reviews           = $true
    }
    restrictions = $null
    allow_force_pushes  = $false
    allow_deletions     = $false
    required_linear_history = $false
} | ConvertTo-Json -Depth 5

Write-Host "Setting branch protection on $owner/$repo ($branch)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method Put -Headers $headers -Body $body -ContentType 'application/json'
    Write-Host 'Branch protection enabled successfully.' -ForegroundColor Green
    Write-Host '  - Require PR with 1 approval' -ForegroundColor White
    Write-Host '  - Dismiss stale reviews' -ForegroundColor White
    Write-Host '  - Require CI status check' -ForegroundColor White
    Write-Host '  - Require up-to-date branches' -ForegroundColor White
    Write-Host '  - Enforce for admins' -ForegroundColor White
    Write-Host '  - Block force push and deletion' -ForegroundColor White
    Write-Host "Verify: https://github.com/$owner/$repo/settings/branches" -ForegroundColor Gray
}
catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg = $_.ErrorDetails.Message
    Write-Host "FAILED: HTTP $code" -ForegroundColor Red
    Write-Host $msg -ForegroundColor Yellow
    exit 1
}
