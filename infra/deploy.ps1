param(
  [string]$BucketName = "union-arena-sim-alpha-585768156719-ap-northeast-1",
  [string]$DistributionId = "EKZ6I8ZXE9OE4"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Build frontend ==="
Push-Location frontend
npm run build
Pop-Location

Write-Host "=== Upload to S3 ==="
aws s3 sync frontend/dist "s3://$BucketName" --delete

Write-Host "=== Invalidate CloudFront cache ==="
aws cloudfront create-invalidation `
  --distribution-id $DistributionId `
  --paths "/*"

Write-Host "=== Deploy completed ==="