# 嘟嘟收件箱

[![](https://img.shields.io/badge/Language-EN-green.svg)](./README.md)

中国计算机设计大赛 2023 项目仓库

## 1. 软件介绍

### 1.1 作品简介

……

### 1.2 技术特点

……

### 1.3 功能文档

……

## 2. 快速入门

### 2.1 环境配置

#### 2.1.1 本地环境

**推荐创建一个新的虚拟环境**，详见[虚拟环境](#212-虚拟环境)。直接配置需要承担打乱已有环境的风险（当然有经验的用户请随意啦）。

开始前，请确保你的系统安装配置了 Python 相关环境和 pip。Windows 用户请使用 Python 3.7 以上的环境，Ubuntu 用户可以使用系统默认的 Python3 环境（在执行下面的命令时，如果系统没有识别 Python 命令，请使用 Python3 代替）。

首先检查当前环境是否满足依赖要求。定位到项目根目录，在终端输入如下命令：

```shell
pip check -r requirements.txt
```

如果没有未满足的依赖，可以直接跳到[项目部署](#22-项目部署)。否则执行如下命令安装依赖：

```shell
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

安装完毕后就可以部署项目了，详见[项目部署](#22-项目部署)。

#### 2.1.2 虚拟环境

这里仅给出使用 venv 和 conda 创建虚拟环境的方法，其余方式请用户自行选择。

- 使用 venv

venv 是 Python 官方自带的多环境管理工具，不需要再安装任何第三方库就可以实现多环境管理。

在项目根目录执行如下命令创建虚拟环境：

```shell
python -m venv ./dodo-venv
```

- 使用 conda

conda 是 ……

### 2.2 项目部署

……

## 3. 代码贡献

提交请按照如下格式

```
update: {action} {something}
```

详情参见 [commitlint.config.js](commitlint.config.js)。

## 4. 许可

[MIT © Richard McRichface.](https://github.com/RichardLitt/standard-readme/blob/main/LICENSE)
