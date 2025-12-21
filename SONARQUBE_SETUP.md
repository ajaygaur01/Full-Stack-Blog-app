# SonarQube Setup Guide for Jenkins

## Understanding the Variables

### `SONAR_PROJECT_KEY` (Line 5)
- **What it is**: A unique identifier for your project in SonarQube
- **Current value**: `"blog-project"`
- **Action**: You can keep this or change it to match your project name
- **Example**: `"blog-project"`, `"full-stack-blog"`, `"my-blog-app"`

### `SONARQUBE_SERVER` (Line 6)
- **What it is**: The name/ID of the SonarQube server configuration in Jenkins
- **Current value**: `"sonarqube"`
- **Action**: This must match the name you configure in Jenkins (see steps below)

---

## Step-by-Step Setup

### Step 1: Get SonarQube Token

1. **Access your SonarQube server** (e.g., `http://your-sonarqube-server:9000`)
2. **Login** to SonarQube
3. Go to **My Account** → **Security** (or **User** → **My Account** → **Security**)
4. Under **Generate Tokens**, enter a name (e.g., `jenkins-token`)
5. Click **Generate**
6. **Copy the token immediately** (you won't see it again!)

---

### Step 2: Configure SonarQube Server in Jenkins

1. **Install SonarQube Plugin** (if not already installed):
   - Go to **Manage Jenkins** → **Plugins**
   - Search for **"SonarQube Scanner"** or **"SonarQube"**
   - Install and restart Jenkins

2. **Add SonarQube Server Configuration**:
   - Go to **Manage Jenkins** → **System** (or **Configure System**)
   - Scroll down to **SonarQube servers** section
   - Click **Add SonarQube**
   - Fill in:
     - **Name**: `sonarqube` (must match `SONARQUBE_SERVER` in Jenkinsfile)
     - **Server URL**: Your SonarQube server URL (e.g., `http://sonarqube:9000` or `https://sonarqube.example.com`)
     - **Server authentication token**: Click **Add** → **Jenkins**
       - **Kind**: Secret text
       - **Secret**: Paste the token you generated in Step 1
       - **ID**: `sonarqube-token` (or any name)
       - Click **Add**
     - Select the token from the dropdown
   - Click **Save**

---

### Step 3: Verify Configuration

1. Go to your Jenkins job
2. Run the pipeline
3. The **SonarQube Analysis** stage should authenticate automatically using the configured server

---

## Alternative: Using Environment Variables

If you prefer to use environment variables instead of hardcoding:

### Option 1: In Jenkinsfile
```groovy
environment {
    SONAR_PROJECT_KEY = "${SONAR_PROJECT_KEY ?: 'blog-project'}"
    SONARQUBE_SERVER = "${SONARQUBE_SERVER ?: 'sonarqube'}"
}
```

Then set them in Jenkins UI:
- **Manage Jenkins** → **Configure System** → **Global properties** → **Environment variables**
- Add:
  - `SONAR_PROJECT_KEY` = `blog-project`
  - `SONARQUBE_SERVER` = `sonarqube`

### Option 2: Job-Specific
- Go to your Jenkins job → **Configure**
- **Build Environment** → **Inject environment variables**
- Add the variables there

---

## Troubleshooting

### Error: "SonarQube server 'sonarqube' not found"
- Check that the server name in Jenkins matches `SONARQUBE_SERVER` in Jenkinsfile
- Verify SonarQube server is configured in **Manage Jenkins** → **System**

### Error: "Authentication failed"
- Verify the token is correct
- Check token hasn't expired
- Ensure SonarQube server URL is accessible from Jenkins

### Error: "Project key already exists"
- Change `SONAR_PROJECT_KEY` to a unique value
- Or delete the existing project in SonarQube

---

## Quick Reference

| Variable | Type | Where to Set | Example Value |
|----------|------|--------------|---------------|
| `SONAR_PROJECT_KEY` | Project Identifier | Jenkinsfile (line 5) or Jenkins UI | `"blog-project"` |
| `SONARQUBE_SERVER` | Server Config Name | Jenkinsfile (line 6) | `"sonarqube"` |
| SonarQube Token | Secret | Jenkins → Manage Jenkins → System → SonarQube servers | (generated token) |
| SonarQube URL | Server URL | Jenkins → Manage Jenkins → System → SonarQube servers | `http://sonarqube:9000` |

---

## Summary

**You don't need to "get" credentials for these variables** - they're configuration values:

1. **SONAR_PROJECT_KEY**: Just a project name - keep `"blog-project"` or change it
2. **SONARQUBE_SERVER**: Must match the server name you configure in Jenkins
3. **Actual credentials**: The SonarQube token goes in Jenkins server configuration, not in the Jenkinsfile

The `withSonarQubeEnv('sonarqube')` wrapper automatically uses the credentials you configured in Jenkins!

