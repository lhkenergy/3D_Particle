# 3D 粒子交互系统

这是一个基于 Three.js 和 MediaPipe 的实时交互 3D 粒子系统。用户可以通过摄像头手势控制粒子的缩放和扩散。

## 功能特性

- **手势控制**: 
  - 使用 MediaPipe Hands 进行手部追踪。
  - 双手距离控制粒子群的扩散程度（双手张开 -> 粒子扩散/放大）。
  - 单手捏合也可进行简单控制（作为后备方案）。
- **多模型切换**: 支持爱心、花朵、土星、佛像（抽象）、烟花等多种粒子形态。
- **实时渲染**: 使用 Three.js 进行高性能 WebGL 渲染。
- **自定义颜色**: 支持实时调整粒子颜色。
- **自适应显示**: 响应式设计，支持全屏模式。
- **自动演示**: 当未检测到手势时，粒子系统会自动旋转展示。

## 运行方式

由于使用了 ES Modules 和摄像头权限，建议使用本地服务器运行。

### 使用 VS Code Live Server (推荐)

1. 在 VS Code 中安装 "Live Server" 扩展。
2. 右键点击 `index.html`，选择 "Open with Live Server"。
3. 浏览器将自动打开，请允许摄像头权限以使用手势控制功能。

### 使用 Python

如果你安装了 Python，也可以在项目根目录下运行：

```bash
python -m http.server
```

然后访问 `http://localhost:8000`。

## 技术栈

- **Three.js**: 3D 渲染引擎
- **MediaPipe Hands**: 计算机视觉手势识别
- **HTML5/CSS3**: 界面布局与样式
- **JavaScript (ES6+)**: 核心逻辑

## 文件结构

- `index.html`: 入口文件
- `style.css`: 样式文件
- `src/`:
  - `main.js`: 主程序入口
  - `particleSystem.js`: 粒子系统核心类
  - `handTracking.js`: 手势识别封装类
  - `shapes.js`: 粒子形状生成算法
