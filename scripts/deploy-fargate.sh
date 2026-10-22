#!/usr/bin/env bash
# ==============================================================================
# Automated AWS ECS Fargate Deployment Script for Aetherium Codex & Digital Library
# ==============================================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-af-south-1}"
CLUSTER_NAME="${CLUSTER_NAME:-aether-cluster}"
SERVICE_NAME="${SERVICE_NAME:-aether-codex-service}"
REPO_NAME="${REPO_NAME:-aether-codex}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "=========================================================="
echo "  AETHERIUM CODEX // AWS ECS FARGATE DEPLOYMENT ENGINE    "
echo "=========================================================="

# 1. Verify AWS Authentication
echo "[1/7] Verifying AWS CLI authentication..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
USER_ARN=$(aws sts get-caller-identity --query "Arn" --output text)
echo "  Authenticated as: ${USER_ARN}"
echo "  AWS Account ID:   ${AWS_ACCOUNT_ID}"
echo "  AWS Region:       ${AWS_REGION}"

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
FULL_IMAGE_URI="${ECR_URI}/${REPO_NAME}:${IMAGE_TAG}"

# 2. Check/Create ECR Repository
echo "[2/7] Checking Amazon ECR repository '${REPO_NAME}'..."
if ! aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "  Creating ECR repository '${REPO_NAME}'..."
  aws ecr create-repository \
    --repository-name "${REPO_NAME}" \
    --region "${AWS_REGION}" \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 >/dev/null
  echo "  ECR repository created."
else
  echo "  ECR repository exists."
fi

# 3. Docker Login to ECR
echo "[3/7] Authenticating Docker to Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_URI}"

# 4. Build Docker Image
echo "[4/7] Building production Docker container image (linux/amd64)..."
docker build --platform linux/amd64 -t "${REPO_NAME}:${IMAGE_TAG}" -f Dockerfile .
docker tag "${REPO_NAME}:${IMAGE_TAG}" "${FULL_IMAGE_URI}"

# 5. Push Image to ECR
echo "[5/7] Pushing container image to Amazon ECR..."
docker push "${FULL_IMAGE_URI}"

# 6. Register ECS Task Definition
echo "[6/7] Registering ECS Fargate task definition..."
RENDERED_TASK_DEF=$(sed \
  -e "s|<AWS_ACCOUNT_ID>|${AWS_ACCOUNT_ID}|g" \
  -e "s|<AWS_REGION>|${AWS_REGION}|g" \
  ecs-task-definition.json)

TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "${RENDERED_TASK_DEF}" \
  --region "${AWS_REGION}" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)
echo "  Registered Task Definition: ${TASK_DEF_ARN}"

# 7. Update ECS Service
echo "[7/7] Updating ECS Fargate service '${SERVICE_NAME}' in cluster '${CLUSTER_NAME}'..."
if aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --region "${AWS_REGION}" --query "services[0].status" --output text | grep -q "ACTIVE"; then
  aws ecs update-service \
    --cluster "${CLUSTER_NAME}" \
    --service "${SERVICE_NAME}" \
    --task-definition "${TASK_DEF_ARN}" \
    --force-new-deployment \
    --region "${AWS_REGION}" >/dev/null
  echo "  Deployment initiated successfully!"
  echo "  Monitoring service rollout:"
  aws ecs wait services-stable --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --region "${AWS_REGION}"
  echo "  Service is stable and healthy!"
else
  echo "  Notice: ECS Service '${SERVICE_NAME}' not found in cluster '${CLUSTER_NAME}'."
  echo "  Create the service using AWS CLI or Terraform."
fi

echo "=========================================================="
echo "  AETHERIUM CODEX AWS FARGATE DEPLOYMENT COMPLETED       "
echo "=========================================================="
