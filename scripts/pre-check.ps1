# 定义函数
function Test-CommandInstalled([string]$CommandName) {
    $command = Get-Command $CommandName -ErrorAction SilentlyContinue
    if ($command) {
        return $true
    }
    else {
        return $false
    }
}

$location = Get-Location

# 检测Node命令是否存在
if (!(Test-CommandInstalled node)) {
    Write-Host "未检测到nodejs环境，尝试使用winget安装..."
    # 检测winget是否存在
    if (!(Test-CommandInstalled winget)) {
        Write-Host "未检测到 winget，无法完成安装，请检测系统版本，或尝试安装 winget:https://www.microsoft.com/p/app-installer/9nblggh4nns1#activetab=pivot:overviewtab"
    }
    else {
        winget install OpenJS.Nodejs --silent
        Write-Host "nodejs 安装完成，版本为："
        node --version
    }
}else{
    Write-Host "检测到 nodejs 环境，版本为："
    node --version
}

# 检测Git命令是否存在
if (!(Test-CommandInstalled git)) {
    Write-Host "未检测到 git 环境，尝试使用winget安装..."
    # 检测winget是否存在
    if (!(Test-CommandInstalled winget)) {
        Write-Host "未检测到 winget，无法完成安装，请检测系统版本，或尝试安装 winget:https://www.microsoft.com/p/app-installer/9nblggh4nns1#activetab=pivot:overviewtab"
    }
    else {
        winget install --id Git.Git -e --source winget
        Write-Host "git 安装完成，版本为："
        git --version
    }
}else{
    Write-Host "检测到 git 环境，版本为："
    git --version
}

# 检测Yarn命令是否存在
if (!(Test-CommandInstalled yarn)) {
    Write-Host "未检测到 yarn 环境，尝试使用winget安装..."
    # 检测winget是否存在
    if (!(Test-CommandInstalled npm)) {
        Write-Host "未检测到 npm，请尝试手动下载 NodeJS (https://nodejs.org/en/download)"
    }
    else {
        npm install --global yarn
        Write-Host "yarn 安装完成，版本为："
        yarn --version
    }
}else{
    Write-Host "检测到 yarn 环境，版本为："
    yarn --version
}