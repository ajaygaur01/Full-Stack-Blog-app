# Jenkins Pipeline Configuration Guide

## Where to Configure Environment Variables

You have **two options** for setting environment variables:

---

## Option 1: Jenkins UI (RECOMMENDED - More Secure)

### For Global Variables (All Pipelines):

1. Go to **Jenkins Dashboard**
2. Click **Manage Jenkins** → **System** (or **Configure System**)
3. Scroll down to **Global properties**
4. Check **Environment variables**
5. Click **Add** and add these variables:

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `AWS_REGION` | `us-east-1` | Your AWS region |
| `AWS_ACCOUNT_ID` | `123456789012` | Your 12-digit AWS account ID |
| `ECR_BACKEND_REPO` | `blog-backend` | ECR repository name for backend |
| `ECR_FRONTEND_REPO` | `blog-frontend` | ECR repository name for frontend |

### For Job-Specific Variables (This Pipeline Only):

1. Go to your **Jenkins Job** (the one using this Jenkinsfile)
2. Click **Configure**
3. Scroll down to **Build Environment**
4. Check **Use secret text(s) or file(s)**
5. Under **Bindings**, add:
   - **Variable**: `AWS_REGION`, **Secret**: (your region)
   - **Variable**: `AWS_ACCOUNT_ID`, **Secret**: (your account ID)
   - **Variable**: `ECR_BACKEND_REPO`, **Secret**: (your repo name)
   - **Variable**: `ECR_FRONTEND_REPO`, **Secret**: (your repo name)

OR

1. In **Build Environment** section
2. Check **Inject environment variables to the build process**
3. In **Properties Content**, add:
   ```
   AWS_REGION=us-east-1
   AWS_ACCOUNT_ID=123456789012
   ECR_BACKEND_REPO=blog-backend
   ECR_FRONTEND_REPO=blog-frontend
   ```

---

## Option 2: Directly in Jenkinsfile (Less Secure)

If you prefer to set values directly in the Jenkinsfile, edit the `environment` block:

```groovy
environment {
    AWS_REGION = "us-east-1"  // Your AWS region
    AWS_ACCOUNT_ID = "123456789012"  // Your AWS account ID
    ECR_BACKEND_REPO = "blog-backend"  // Your ECR repo name
    ECR_FRONTEND_REPO = "blog-frontend"  // Your ECR repo name
}
```

⚠️ **Warning**: This exposes values in your repository. Only use for non-sensitive values.

---

## AWS Credentials Configuration

The pipeline needs AWS credentials to push to ECR. Configure them using one of these methods:

### Method 1: AWS Credentials Plugin (Recommended)

1. Install **Pipeline: AWS Steps** plugin in Jenkins
2. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
3. Click **Add Credentials**
4. Select **AWS Credentials**
5. Enter:
   - **ID**: `aws-ecr-credentials` (or any name)
   - **Access Key ID**: Your AWS access key
   - **Secret Access Key**: Your AWS secret key
6. Update the Jenkinsfile to use these credentials (see below)

### Method 2: Environment Variables

Add these to Jenkins (same way as above):

| Variable Name | Description |
|--------------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |

### Method 3: IAM Role (If Jenkins runs on EC2)

1. Create an IAM role with ECR permissions
2. Attach the role to your EC2 instance running Jenkins
3. No additional configuration needed - AWS CLI will use the role automatically

---

## Required IAM Permissions

The AWS credentials/role need these ECR permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Prerequisites Checklist

- [ ] ECR repositories created in AWS:
  ```bash
  aws ecr create-repository --repository-name blog-backend --region us-east-1
  aws ecr create-repository --repository-name blog-frontend --region us-east-1
  ```
- [ ] AWS CLI installed on Jenkins agent
- [ ] Docker installed on Jenkins agent
- [ ] AWS credentials configured in Jenkins
- [ ] Environment variables set (using Option 1 or 2 above)

---

## Testing Your Configuration

After setting up, run your pipeline and check:

1. **Build Docker Images** stage should complete successfully
2. **Authenticate to ECR** stage should show "ECR authentication successful!"
3. **Push Images to ECR** stage should show "Images pushed successfully!"
4. Verify in AWS Console → ECR → Your repositories that images appear

---

## Troubleshooting

### Error: "Unable to locate credentials"
- Check AWS credentials are configured correctly
- Verify credentials have ECR permissions

### Error: "Repository does not exist"
- Create ECR repositories in AWS Console or using AWS CLI
- Verify repository names match `ECR_BACKEND_REPO` and `ECR_FRONTEND_REPO`

### Error: "Access Denied"
- Check IAM permissions for ECR
- Verify AWS account ID is correct

