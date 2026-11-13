cd "$(dirname "$0")" || exit

# 判断是否安装了 Bun
if ! type bun >/dev/null 2>&1; then
    echo "未检测到 bun 环境，尝试使用homebrew安装..."
    # 检测homebrew是否存在
    if ! type brew >/dev/null 2>&1; then
        echo "未检测到 homebrew，请手动安装 homebrew 后进行尝试 (https://brew.sh/)"
    else
        brew tap oven-sh/bun
        brew install bun
        echo "bun 安装完成，版本为: "
        bun --version
    fi
else
    echo "检测到 bun 环境，版本为："
    bun --version
fi

if ! type git >/dev/null 2>&1; then
    echo "未检测到 git 环境，尝试使用 homebrew 安装..."
    # 检测 homebrew 是否存在
    if ! type brew >/dev/null 2>&1; then
        echo "未检测到 homebrew，请手动安装 homebrew 后进行尝试 (https://brew.sh/)"
    else
        brew install git
        echo "git 安装完成，版本为: "
        git --version
    fi
else
    echo "检测到 git 环境，版本为："
    git --version
fi
