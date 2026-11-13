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

# 检测Bun命令是否存在
if (!(Test-CommandInstalled bun)) {
    Write-Host "未检测到 bun 环境，尝试使用winget安装..."
    # 检测winget是否存在
    if (!(Test-CommandInstalled winget)) {
        Write-Host "未检测到 winget，无法完成安装，请检测系统版本，或尝试安装 winget:https://www.microsoft.com/p/app-installer/9nblggh4nns1#activetab=pivot:overviewtab"
    }
    else {
        winget install Oven-sh.Bun --silent
        Write-Host "bun 安装完成，版本为："
        bun --version
    }
}else{
    Write-Host "检测到 bun 环境，版本为："
    bun --version
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
