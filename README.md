# Reverfiy
A Verfiy tools on GitHub Pages , likes Cloudflare RECAPTCHA

在 GitHub Pages 上注入 **Cloudflare Turnstile 风格**的人机验证层。只需在 GitHub Actions 中添加一步，无需修改业务 HTML，访客访问时会先看到验证卡片，点击「我是真人」通过后才会展示页面内容。

> **Demo**：https://pglp006688.github.io/Reverfiy/

---

## 效果预览

访客首次访问时看到全屏遮罩 + 验证卡片：

```
┌──────────────────────────────────────┐
│  [✓]  xxxxx.github.io                │
│       本网站启用了 Reverfiy，         │
│       请完成人机验证                  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │          我是真人               │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

点击按钮后依次显示「验证中…」→「验证成功」，遮罩淡出，页面恢复可交互。

---

## 快速开始

### 1. 把 Reverfiy 加入你的仓库

**方式 A：复制文件**（适合自用）

把以下 4 个文件复制到你仓库根目录：

```
action.yml
inject.js
reverfiy.js
```

以及 `.github/workflows/deploy.yml`（见下一步）。

**方式 B：引用独立 Action**（推荐，需 Reverfiy 已发布为独立仓库）

```yaml
uses: pglp006688/Reverfiy@v1
```

### 2. 配置 GitHub Pages

仓库 → **Settings → Pages → Source**，选择 **GitHub Actions**（不是 `Deploy from a branch`）。

### 3. 添加 workflow

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy with Reverfiy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
  actions: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Delete stale github-pages artifacts
        uses: geekyeggo/delete-artifact@v5
        with:
          name: github-pages
          failOnError: false
        continue-on-error: true

      - name: Inject Reverfiy
        uses: ./
        with:
          path: index.html
          output: dist

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

> 如果是独立 Action，把 `uses: ./` 换成 `uses: pglp006688/Reverfiy@v1`。

### 4. Push 并访问

推到 `main` 后等 workflow 完成，访问你的 Pages 网址即可看到验证层。

---

## 配置参数

| 参数 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `path` | 否 | `index.html` | 要保护的 HTML 文件或目录。传目录时会递归注入所有 `.html` |
| `output` | 否 | `''` | 输出目录。指定后会把站点复制到该目录再注入，避免把 `.git` / `.github` 等无关文件打进 artifact。留空则原地修改 |

**示例：站点在 `docs/` 目录**

```yaml
      - name: Inject Reverfiy
        uses: ./
        with:
          path: docs
          output: dist
```

---

---


## License

见 [LICENSE](./LICENSE)。
