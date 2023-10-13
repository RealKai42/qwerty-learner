cd `dirname $0`

# 判断是否安装了 Node
if ! type node >/dev/null 2>&1; then
	echo "未检测到nodejs环境，尝试使用homebrew安装..."
	# 检测homebrew是否存在
	if ! type brew >/dev/null 2>&1; then
		echo "未检测到homebrew，无法完成安装，请安装homebrew或直接安装nodejs"
	else
		brew install node
	fi
fi

cd ..
echo "开始安装依赖..."
yarn install --registry=https://registry.npm.taobao.org
echo "依赖安装完成，启动程序..."

# 在浏览器中打开
open http://localhost:5173/

# 本地开启服务
npm run start

# 返回原始目录并退出
cd `dirname $0`
exit
