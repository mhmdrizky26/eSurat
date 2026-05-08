# Production Setup: esuratku.my.id

## 1. DNS & Domain Configuration

```
esuratku.my.id → ALB DNS name (AWS)
                 ↓
           Application Load Balancer
                 ↓
      ┌─────────┴─────────┐
      ↓                   ↓
  Frontend (Port 80)   Backend (Port 3000)
  ECS Task             ECS Task
```

### 1.1 Update DNS Records
Update domain registrar untuk mengarah ke ALB:

```
Type: A Record
Name: esuratku.my.id
Value: <ALB DNS Name dari AWS>
TTL: 300
```

## 2. AWS ECS Cluster Setup

### 2.1 Create VPC & Subnets
```bash
# Ensure you have VPC with public subnets for ALB
# Public Subnets (for ALB): us-east-1a, us-east-1b
# Private Subnets (for ECS): us-east-1a, us-east-1b
```

### 2.2 Create Application Load Balancer (ALB)

**Frontend Target Group:**
- Name: `esurat-frontend-tg`
- Port: `80`
- Health Check Path: `/health`
- Port: 80

**Backend Target Group:**
- Name: `esurat-backend-tg`
- Port: `3000`
- Health Check Path: `/`
- Port: 3000

### 2.3 ALB Listener Rules

```
Port 80/443 (HTTP/HTTPS):
├─ Host: esuratku.my.id
│  ├─ Path: /api/* → backend-tg (esurat-backend-tg)
│  └─ Path: /* → frontend-tg (esurat-frontend-tg)
```

### 2.4 ECS Task Definitions

**Backend Task Definition (esurat-backend):**
```json
{
  "family": "esurat-backend",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "653483324747.dkr.ecr.us-east-1.amazonaws.com/repo-esurat:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "CORS_ORIGIN",
          "value": "https://esuratku.my.id"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/esurat-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
        "interval": 10,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512"
}
```

**Frontend Task Definition (esurat-frontend):**
```json
{
  "family": "esurat-frontend",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "653483324747.dkr.ecr.us-east-1.amazonaws.com/repo-esurat-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/esurat-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost/ || exit 1"],
        "interval": 10,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512"
}
```

### 2.5 ECS Services

**Backend Service:**
```bash
Name: esurat-task-service
Cluster: cluster-esurat
Task Definition: esurat-backend
Desired Count: 2
Target Group: esurat-backend-tg
```

**Frontend Service:**
```bash
Name: esurat-task-fe-service
Cluster: cluster-esurat
Task Definition: esurat-frontend
Desired Count: 2
Target Group: esurat-frontend-tg
```

## 3. Environment Variables

### Production Backend (.env)
```
NODE_ENV=production
PORT=3000
DB_HOST=db-esurat.cu7s86q8qmcp.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=<secure-password>
DB_NAME=esurat
S3_BUCKET=bucket-esurat
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
CORS_ORIGIN=https://esuratku.my.id
```

### Production Frontend Build Args
CI/CD akan pass:
```
VITE_BACKEND_URL=https://esuratku.my.id/api
```

## 4. HTTPS/SSL Setup

### 4.1 Request SSL Certificate
```bash
# Via AWS Certificate Manager
aws acm request-certificate \
  --domain-name esuratku.my.id \
  --validation-method DNS \
  --region us-east-1
```

### 4.2 Update ALB Listener
- Add HTTPS listener on port 443
- Attach SSL certificate
- Redirect HTTP (80) → HTTPS (443)

## 5. CI/CD Deployment Flow

```
1. Push ke main branch
                ↓
2. GitHub Actions Workflow Triggered
                ↓
3. Build Backend Docker Image
   - Build dengan prod config
   - Push ke ECR: repo-esurat:latest
                ↓
4. Build Frontend Docker Image
   - Build arg: VITE_BACKEND_URL=https://esuratku.my.id/api
   - Push ke ECR: repo-esurat-frontend:latest
                ↓
5. Update ECS Services
   - Force new deployment backend
   - Force new deployment frontend
                ↓
6. ECS Pull images dari ECR
                ↓
7. Services auto-scale & health-check
```

## 6. Monitoring & Logging

### CloudWatch Logs
```
- /ecs/esurat-backend
- /ecs/esurat-frontend
```

### Health Checks
- Backend: `GET http://backend:3000/`
- Frontend: `GET http://frontend/health`
- ALB: 10s interval, 3 retries

## 7. Verification Checklist

- [ ] Domain DNS pointing ke ALB
- [ ] ALB listeners configured (port 80, 443)
- [ ] Target groups created & registered
- [ ] ECS tasks running & healthy
- [ ] CloudWatch logs appearing
- [ ] CORS origins include production domain
- [ ] Frontend env vars correct
- [ ] Backend database reachable
- [ ] S3 bucket access working
- [ ] SSL certificate installed

## 8. Testing Production

```bash
# Test frontend
curl -I https://esuratku.my.id/
# Expected: 200 OK

# Test API
curl -I https://esuratku.my.id/api/
# Expected: 200 OK

# Test with credentials
curl -X POST https://esuratku.my.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

## 9. Troubleshooting

### Frontend tidak load
```bash
# Check if files built correctly
docker exec <frontend-container> ls -la /usr/share/nginx/html/

# Check nginx logs
docker logs <frontend-container> 
```

### API call error
```bash
# Check CORS headers
curl -H "Origin: https://esuratku.my.id" -I https://esuratku.my.id/api/

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn <tg-arn>
```

### Database connection error
```bash
# Verify RDS security group
aws ec2 describe-security-groups --group-ids sg-xxx

# Test connection
mysql -h db-esurat.cu7s86q8qmcp.us-east-1.rds.amazonaws.com -u admin -p
```

## 10. Rollback Plan

Jika ada issue:
```bash
# Rollback backend
aws ecs update-service \
  --cluster cluster-esurat \
  --service esurat-task-service \
  --force-new-deployment \
  --region us-east-1

# Rollback frontend
aws ecs update-service \
  --cluster cluster-esurat \
  --service esurat-task-fe-service \
  --force-new-deployment \
  --region us-east-1
```

ECS akan pull image sebelumnya (dari image cache atau ECR history).
