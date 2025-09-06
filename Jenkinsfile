pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // 克隆当前分支的代码
                checkout scm
                echo "The current branch is : $gitlabTargetBranch"
                script {
                    echo "The current branch is: $gitlabTargetBranch"
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    // 根据分支名称执行不同的构建命令
                    if (env.gitlabTargetBranch == 'deploy_staging') {
                        sh 'docker build -t baraka-bot-staging .'
                    } else if (env.gitlabTargetBranch == 'deploy_prod') {
                        sh 'docker build -t baraka-bot-prod .'
                    }
                }
            }
        }

        stage('Clean') {
            steps {
                script {
                    if (env.gitlabTargetBranch == 'deploy_staging') {
                        sh 'docker-compose -f docker-compose-staging.yml down'
                    } else if (env.gitlabTargetBranch == 'deploy_prod') {
                        sh 'docker-compose -f docker-compose.yml down'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // 部署步骤可以根据需要调整
                    if (env.gitlabTargetBranch == 'deploy_staging') {
                        sh 'docker-compose -f docker-compose-staging.yml up -d'
                    } else if (env.gitlabTargetBranch == 'deploy_prod') {
                        sh 'docker-compose -f docker-compose.yml up -d'
                    }
                }
            }
        }
    }

    post {
        always {
            // 清理工作空间
            cleanWs()
        }
        success {
            script {
                echo 'Build succeeded'
            }
        }
        failure {
            script {
                echo 'Build failed'
            }
        }
        unstable {
            script {
                echo 'Build is unstable'
            }
        }
        changed {
            script {
                echo 'Build status changed'
            }
        }
    }
}
