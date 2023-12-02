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
        Write-Host "未检测到winget，无法完成安装，请检测系统版本，或尝试安装winget:https://www.microsoft.com/p/app-installer/9nblggh4nns1#activetab=pivot:overviewtab"
    }
    else {
        winget install OpenJS.Nodejs --silent
        Write-Host "nodejs 安装完成"
    }
}else{
    Write-Host "已安装nodejs!"
    Set-Location ..
    Write-Host "开始安装依赖..."
    yarn install --registry=https://registry.npm.taobao.org
    Write-Host "依赖安装完成，启动程序..."
    
    Start-Job -ScriptBlock {
        Start-Sleep 4
        Start-Process http://localhost:5173/
    } | Out-Null
    npm run start
    Set-Location $location
}
