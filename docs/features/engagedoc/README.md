# EngageDoc-Studio システム - Media Viewer v209

## 概要
EngageDoc-Studioは、Media Viewer v208で開発された高度なドキュメント表示・編集システムです。フレームベースのコンテンツ管理、インタラクティブなズーム操作、両側コントロールエリアによる直感的な操作環境を提供します。

## 🎯 主要機能

### 1. EngageDoc-Reader
高性能なドキュメントビューアーアプリケーション
- **PDF、画像、SVG、専用EGDC形式の統合表示**
- **D3.jsベースの高精度ズーム・パン操作**
- **フレーム単位でのナビゲーション**
- **マルチタブインターフェース**

### 2. Frame Sheets Editor
ドキュメントレイアウト編集システム
- **フレームプレビュー統合**
- **ドラッグ&ドロップによる要素配置**
- **リアルタイムプレビュー**
- **PowerPoint連携エクスポート**

### 3. 両側コントロールエリア
v208の主要新機能
- **左パネル**: エレメント管理、レイヤー制御
- **右パネル**: プロパティ編集、設定
- **統合ツールバー**: ファイル操作、表示制御
- **ステータスバー**: 進捗、情報表示

## 📁 ディレクトリ構造

```
EngageDoc-Studio/
├── EngageDoc-Reader/              # コアビューアーアプリケーション
│   ├── src/
│   │   ├── main.js               # Electronメインプロセス
│   │   ├── preload.js            # セキュリティブリッジ
│   │   ├── viewer.html           # メインUI
│   │   ├── viewer.js             # ビューアーロジック
│   │   └── viewer.css            # スタイル
│   ├── package.json              # 依存関係・スクリプト
│   └── DEVELOPMENT_HISTORY.md    # 開発履歴
│
├── EngageDoc-Studio-Start.ps1    # 起動用PowerShellスクリプト
├── EngageDoc-Studio-Debug.ps1    # デバッグ用スクリプト
│
└── docs/                         # 関連ドキュメント
    ├── requirements/             # 要件定義
    ├── design/                   # UI/UXデザイン
    └── architecture/             # システム設計
```

## 🏗️ アーキテクチャ概要

### 技術スタック
- **Electron**: クロスプラットフォームデスクトップアプリ
- **D3.js**: 高度なズーム・変形処理
- **Node.js**: ファイルシステム・システム統合
- **PowerShell**: 起動・デバッグスクリプト

### プロセス構成
```
┌─────────────────────────────────────────────────────────┐
│                 Operating System                        │
├─────────────────────────────────────────────────────────┤
│                    Electron                             │
├──────────────────────┬──────────────────────────────────┤
│   Main Process       │      Renderer Process            │
│   (Node.js)          │      (Chromium + D3.js)          │
│                      │                                  │
│ ┌─────────────────┐  │  ┌─────────────────────────────┐ │
│ │ App Lifecycle   │  │  │       UI Layer              │ │
│ │ Window Manager  │  │  │  ┌────────┬────────────────┐ │ │
│ │ File Handler    │  │  │  │ Left   │ Main Content   │ │ │
│ │ IPC Bridge      │  │  │  │ Panel  │    Area        │ │ │
│ └─────────────────┘  │  │  └────────┼────────────────┤ │ │
│                      │  │           │ Right Panel    │ │ │
│ ┌─────────────────┐  │  │           └────────────────┘ │ │
│ │ Native APIs     │  │  ├─────────────────────────────┤ │
│ │ - File Dialog   │  │  │     D3 Zoom Handler         │ │
│ │ - OS Integration│  │  │     Content Renderer        │ │
│ └─────────────────┘  │  │     State Manager           │ │
└──────────────────────┴──└─────────────────────────────┘ │
```

## 🎨 UI/UXデザイン

### メインインターフェース
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [File] [Edit] [View] [Tools] [Help]           [🔍] [⚙️] [?]           │
├─────────────────────────────────────────────────────────────────────────┤
│ [📄][📊][🖼️] │ Document.pdf                    │ [💾][📤][🖨️] [100%▼]│
├────────────────┬────────────────────────────────┬─────────────────────────┤
│ 📐 Elements    │                                │    📋 Properties       │
│                │                                │                         │
│ ▼ 📐 Frames    │          Main Canvas           │ ▼ Position & Size      │
│ • Frame 1      │                                │   X: [120] Y: [80]     │
│ • Frame 2      │    ┌─────────────────────┐     │   W: [240] H: [180]    │
│                │    │                     │     │                         │
│ ▼ 📝 Text      │    │   Document Content  │     │ ▼ Appearance           │
│ • Title        │    │                     │     │   Border: [None ▼]     │
│ • Description  │    │                     │     │   Shadow: □ Enabled    │
│                │    └─────────────────────┘     │                         │
│ ▼ 🖼️ Images    │                                │ ▼ Behavior             │
│ • Logo         │                                │   Link: ☑ Enabled     │
│                │                                │   Action: [Zoom ▼]     │
├────────────────┴────────────────────────────────┴─────────────────────────┤
│ Status: Ready │ Zoom: 100% │ Page: 1/5 │ Selection: Frame 1          │
└─────────────────────────────────────────────────────────────────────────┘
```\n\n## 🚀 主要機能詳細\n\n### 1. D3ズーム統合システム\n```javascript\n// 高精度ズーム制御\nclass D3ZoomIntegration {\n  constructor(element, options = {}) {\n    this.zoom = d3.zoom()\n      .scaleExtent([0.1, 10])\n      .on('zoom', this.handleZoom.bind(this));\n      \n    d3.select(element).call(this.zoom);\n  }\n  \n  handleZoom(event) {\n    const { transform } = event;\n    this.updateContent(transform);\n    this.syncWithFrames(transform);\n  }\n}\n```\n\n### 2. フレームプレビューシステム\n- **リアルタイム更新**: ソースフレーム変更の即座反映\n- **品質設定**: Low/Medium/High品質選択\n- **リンク機能**: フレーム間のナビゲーション\n- **アニメーション**: フェード・スライド切替効果\n\n### 3. コンテンツレンダリング\n```javascript\n// 統合レンダリングシステム\nclass ContentRenderer {\n  registerRenderer(type, handler) {\n    this.renderers.set(type, handler);\n  }\n  \n  async render(content, type) {\n    const renderer = this.renderers.get(type);\n    if (!renderer) throw new Error(`No renderer for ${type}`);\n    \n    return await renderer.render(content);\n  }\n}\n\n// PDF レンダラー実装\nclass PDFRenderer {\n  async render(pdfData) {\n    const pdf = await pdfjsLib.getDocument(pdfData).promise;\n    const pages = [];\n    \n    for (let i = 1; i <= pdf.numPages; i++) {\n      const page = await pdf.getPage(i);\n      const canvas = this.renderPage(page);\n      pages.push(canvas);\n    }\n    \n    return pages;\n  }\n}\n```\n\n## 📋 運用スクリプト\n\n### EngageDoc-Studio-Start.ps1\n```powershell\n# EngageDoc-Studio 起動スクリプト\nWrite-Host \"Starting EngageDoc-Studio v208...\" -ForegroundColor Green\n\n# 環境チェック\nif (-not (Test-Path \"node_modules\")) {\n    Write-Host \"Installing dependencies...\" -ForegroundColor Yellow\n    npm install\n}\n\n# アプリケーション起動\nSet-Location \"EngageDoc-Reader\"\nnpm start\n```\n\n### EngageDoc-Studio-Debug.ps1\n```powershell\n# デバッグモード起動\nWrite-Host \"Starting EngageDoc-Studio in DEBUG mode...\" -ForegroundColor Cyan\n\n$env:NODE_ENV = \"development\"\n$env:ELECTRON_ENABLE_LOGGING = \"true\"\n$env:DEBUG = \"engagedoc:*\"\n\nSet-Location \"EngageDoc-Reader\"\nnpm run debug\n```\n\n## 🔧 設定・カスタマイズ\n\n### 設定ファイル構造\n```json\n{\n  \"app\": {\n    \"theme\": \"light\",\n    \"language\": \"ja\",\n    \"autoSave\": true\n  },\n  \"viewer\": {\n    \"defaultZoom\": 1.0,\n    \"zoomStep\": 0.25,\n    \"smoothZoom\": true,\n    \"centerOnLoad\": true\n  },\n  \"panels\": {\n    \"left\": { \"visible\": true, \"width\": 300 },\n    \"right\": { \"visible\": true, \"width\": 350 },\n    \"bottom\": { \"visible\": false, \"height\": 200 }\n  },\n  \"export\": {\n    \"defaultFormat\": \"pptx\",\n    \"quality\": \"high\",\n    \"embedFonts\": true\n  }\n}\n```\n\n### 拡張機能サポート\n- **プラグインAPI**: カスタムレンダラー追加\n- **テーマシステム**: CSS変数ベースの外観カスタマイズ\n- **スクリプト統合**: PowerShell/Batch/Shell script連携\n\n## 🐛 デバッグ・トラブルシューティング\n\n### ログレベル設定\n```javascript\n// デバッグログ設定\nconst logger = {\n  levels: ['ERROR', 'WARN', 'INFO', 'DEBUG'],\n  log(level, message, data = null) {\n    const timestamp = new Date().toISOString();\n    console.log(`[${timestamp}] ${level}: ${message}`, data || '');\n  }\n};\n```\n\n### 一般的な問題と解決策\n1. **起動失敗**: Node.js依存関係の再インストール\n2. **表示崩れ**: キャッシュクリア・設定リセット\n3. **パフォーマンス低下**: メモリ使用量監視・ガベージコレクション\n4. **ファイル読み込みエラー**: パーミッション・ファイル形式確認\n\n## 📈 今後の拡張予定\n\n### v209での改善項目\n1. **ClaudeCode履歴管理統合**\n2. **より高度なフレーム編集機能**\n3. **コラボレーション機能の基盤**\n4. **パフォーマンス最適化**\n5. **アクセシビリティ強化**\n\n---\n\n**開発チーム**: Media Viewer Development Team  \n**最終更新**: 2025-08-12  \n**対応バージョン**: v208 → v209継承予定