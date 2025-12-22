pipeline {
    agent any

    tools {
        sonarQubeScanner 'sonar-scanner'
    }

    environment {
        SONAR_PROJECT_KEY = "devsecops"
        SONARQUBE_SERVER = "sonarqube"
        
        // AWS ECR Configuration
        // Hardcode these values or set them in Jenkins UI
        // AWS credentials (Access Key & Secret) should be in Jenkins Credentials Store (ID: aws-ecr-credentials)
        AWS_REGION = "us-east-1"  // Change to your AWS region
        AWS_ACCOUNT_ID = "202533501381"  // Change to your AWS Account ID
        ECR_BACKEND_REPO = "devsecops-backend"  // Change to your ECR repository name
        ECR_FRONTEND_REPO = "devsecops-frontend"  // Change to your ECR repository name
        
        // AWS Credentials ID from Jenkins Credentials Store
        AWS_CREDENTIALS_ID = "aws-ecr-credentials"  // Change if you used a different ID
        
        // Calculated values (don't change these)
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        BACKEND_IMAGE = "${ECR_REGISTRY}/${ECR_BACKEND_REPO}:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${ECR_REGISTRY}/${ECR_FRONTEND_REPO}:${BUILD_NUMBER}"
        BACKEND_IMAGE_LATEST = "${ECR_REGISTRY}/${ECR_BACKEND_REPO}:latest"
        FRONTEND_IMAGE_LATEST = "${ECR_REGISTRY}/${ECR_FRONTEND_REPO}:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // stage('Gitleaks Scan') {
        //     steps {
        //         sh '''
        //           gitleaks detect --source . --exit-code 1
        //         '''
        //     }
        // }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                      sonar-scanner \
                      -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                      -Dsonar.sources=Backend,Frontend
                    '''
                }
            }
        }

        stage('Sonar Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                  docker build -t blog-backend:${BUILD_NUMBER} -t ${BACKEND_IMAGE} -t ${BACKEND_IMAGE_LATEST} ./Backend
                  docker build -t blog-frontend:${BUILD_NUMBER} -t ${FRONTEND_IMAGE} -t ${FRONTEND_IMAGE_LATEST} ./Frontend
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                  trivy image --severity HIGH,CRITICAL --exit-code 0 --format table blog-backend:${BUILD_NUMBER}
                  trivy image --severity HIGH,CRITICAL --exit-code 0 --format table blog-frontend:${BUILD_NUMBER}
                '''
            }
        }

        stage('Authenticate to ECR') {
            steps {
                script {
                    // Use AWS credentials from Jenkins Credentials Store
                    withAWS(credentials: "${AWS_CREDENTIALS_ID}", region: "${AWS_REGION}") {
                        sh '''
                          echo "Authenticating to ECR..."
                          aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                          echo "ECR authentication successful!"
                        '''
                    }
                }
            }
        }

        stage('Push Images to ECR') {
            steps {
                script {
                    // Use AWS credentials from Jenkins Credentials Store
                    withAWS(credentials: "${AWS_CREDENTIALS_ID}", region: "${AWS_REGION}") {
                        sh '''
                          echo "Pushing backend image to ECR..."
                          docker push ${BACKEND_IMAGE}
                          docker push ${BACKEND_IMAGE_LATEST}
                          
                          echo "Pushing frontend image to ECR..."
                          docker push ${FRONTEND_IMAGE}
                          docker push ${FRONTEND_IMAGE_LATEST}
                          
                          echo "Images pushed successfully!"
                          echo "Backend: ${BACKEND_IMAGE}"
                          echo "Frontend: ${FRONTEND_IMAGE}"
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            sh '''
              docker rmi blog-backend:${BUILD_NUMBER} blog-frontend:${BUILD_NUMBER} || true
            '''
        }
        failure {
            echo "Pipeline failed. Merge blocked."
        }
        success {
            echo "Pipeline passed. Merge allowed."
            echo "Images pushed to ECR:"
            echo "Backend: ${BACKEND_IMAGE}"
            echo "Frontend: ${FRONTEND_IMAGE}"
        }
    }
}
