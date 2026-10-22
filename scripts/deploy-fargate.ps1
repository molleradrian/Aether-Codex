<#
.SYNOPSIS
  Automated AWS ECS Fargate Deployment Script for Aetherium Codex & Digital Library
.DESCRIPTION
  Builds, tags, pushes Docker container image to Amazon ECR, registers the ECS task definition,
  and executes zero-downtime rolling deployment to AWS Fargate.
.EXAMPLE
  .\scripts\deploy-fargate.ps1 -AwsRegion "af-south-1" -ClusterName "aether-cluster"
#>

[CmdletBinding()]
param (
  [string]$AwsRegion = "af-south-1",
  [string]$ClusterName = "aether-cluster",
  [string]$ServiceName = "aether-codex-service",
  [string]$RepoName = "aether-codex",
  [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AETHERIUM CODEX // AWS ECS FARGATE DEPLOYMENT ENGINE    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify AWS Identity
Write-Host "[1/7] Verifying AWS CLI authentication..." -ForegroundColor Yellow
try {
  $callerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
  $awsAccountId = $callerIdentity.Account
  $userArn = $callerIdentity.Arn
  Write-Host "  Authenticated as: $userArn" -ForegroundColor Green
  Write-Host "  AWS Account ID:   $awsAccountId" -ForegroundColor Green
  Write-Host "  AWS Region:       $AwsRegion" -ForegroundColor Green
} catch {
  Write-Error "Failed to authenticate with AWS. Please run 'aws configure' first."
}

$ecrUri = "$awsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$fullImageUri = "$ecrUri/$RepoName`:$ImageTag"

# 2. Check/Create ECR Repository
Write-Host "[2/7] Checking Amazon ECR repository '$RepoName'..." -ForegroundColor Yellow
$repoExists = $false
try {
  $null = aws ecr describe-repositories --repository-names $RepoName --region $AwsRegion 2>$null
  $repoExists = $true
  Write-Host "  ECR Repository exists: $RepoName" -ForegroundColor Green
} catch {
  Write-Host "  Repository not found. Creating ECR repository '$RepoName'..." -ForegroundColor Cyan
  aws ecr create-repository `
    --repository-name $RepoName `
    --region $AwsRegion `
    --image-scanning-configuration scanOnPush=true `
    --encryption-configuration encryptionType=AES256 | Out-Null
  Write-Host "  Created ECR repository successfully." -ForegroundColor Green
}

# 3. Docker Login to ECR
Write-Host "[3/7] Authenticating Docker to Amazon ECR..." -ForegroundColor Yellow
$loginPassword = aws ecr get-login-password --region $AwsRegion
$loginPassword | docker login --username AWS --password-stdin $ecrUri
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker login to ECR failed."
}
Write-Host "  Docker authenticated to $ecrUri" -ForegroundColor Green

# 4. Build Docker Image (linux/amd64 target for Fargate)
Write-Host "[4/7] Building production Docker container image (linux/amd64)..." -ForegroundColor Yellow
docker build --platform linux/amd64 -t "$RepoName`:$ImageTag" -f Dockerfile .
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker build failed."
}
docker tag "$RepoName`:$ImageTag" $fullImageUri
Write-Host "  Built & tagged: $fullImageUri" -ForegroundColor Green

# 5. Push Image to ECR
Write-Host "[5/7] Pushing container image to Amazon ECR..." -ForegroundColor Yellow
docker push $fullImageUri
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker push to ECR failed."
}
Write-Host "  Image pushed successfully." -ForegroundColor Green

# 6. Prepare & Register ECS Task Definition
Write-Host "[6/7] Registering ECS Fargate task definition..." -ForegroundColor Yellow
$taskDefTemplatePath = Join-Path $PSScriptRoot "..\ecs-task-definition.json"
$taskDefContent = Get-Content $taskDefTemplatePath -Raw
$taskDefRendered = $taskDefContent -replace "<AWS_ACCOUNT_ID>", $awsAccountId -replace "<AWS_REGION>", $AwsRegion

$tempTaskDefFile = Join-Path $env:TEMP "ecs-task-def-rendered-$([Guid]::NewGuid()).json"
$taskDefRendered | Out-File -FilePath $tempTaskDefFile -Encoding utf8

$registerResult = aws ecs register-task-definition --cli-input-json "file://$tempTaskDefFile" --region $AwsRegion | ConvertFrom-Json
$taskDefArn = $registerResult.taskDefinition.taskDefinitionArn
Remove-Item $tempTaskDefFile -Force -ErrorAction SilentlyContinue
Write-Host "  Registered Task Definition: $taskDefArn" -ForegroundColor Green

# 7. Update ECS Fargate Service
Write-Host "[7/7] Updating ECS Fargate service '$ServiceName' in cluster '$ClusterName'..." -ForegroundColor Yellow
try {
  $updateResult = aws ecs update-service `
    --cluster $ClusterName `
    --service $ServiceName `
    --task-definition $taskDefArn `
    --force-new-deployment `
    --region $AwsRegion | ConvertFrom-Json
  
  Write-Host "  Deployment initiated successfully!" -ForegroundColor Green
  Write-Host "  Service:          $($updateResult.service.serviceName)" -ForegroundColor Cyan
  Write-Host "  Desired Tasks:    $($updateResult.service.desiredCount)" -ForegroundColor Cyan
  Write-Host "  Pending Tasks:    $($updateResult.service.pendingCount)" -ForegroundColor Cyan
  Write-Host "  Running Tasks:    $($updateResult.service.runningCount)" -ForegroundColor Cyan
  Write-Host "`nTo stream deployment rollout status:" -ForegroundColor Yellow
  Write-Host "  aws ecs wait services-stable --cluster $ClusterName --services $ServiceName --region $AwsRegion" -ForegroundColor White
} catch {
  Write-Warning "Could not update ECS service '$ServiceName'. If this is the initial deployment, create the service using:"
  Write-Host "  aws ecs create-service --cluster $ClusterName --service-name $ServiceName --task-definition $taskDefArn --desired-count 1 --launch-type FARGATE --network-configuration `"awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}`" --region $AwsRegion" -ForegroundColor Cyan
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  AETHERIUM CODEX AWS FARGATE DEPLOYMENT COMPLETED       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
