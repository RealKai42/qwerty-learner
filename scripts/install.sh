cd `dirname $0`

# 判断是否安装了 Bun
if ! type bun >/dev/null 2>&1; then
	echo "未检测到 bun 环境，尝试使用homebrew安装..."
	# 检测homebrew是否存在
	if ! type brew >/dev/null 2>&1; then
		echo "未检测到homebrew，无法完成安装，请安装homebrew或直接安装bun"
	else
		brew tap oven-sh/bun
		brew install bun
	fi
fi

cd ..
echo "开始安装依赖..."
bun install
echo "依赖安装完成，启动程序..."

# 在浏览器中打开
open http://localhost:5173/

# 本地开启服务
bun run start

# 返回原始目录并退出
cd `dirname $0`
exit
