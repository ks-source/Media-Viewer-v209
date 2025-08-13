# セットアップガイド - Media Viewer v209

## 前提条件
- Node.js (v18以上)
- Python 3.8以上（履歴同期用）
- Git

## インストール手順

### 1. リポジトリクローン
```bash
git clone https://github.com/ks-source/Code.git
cd Code/HTML/Media-Viewer/v209
```

### 2. 依存関係インストール
```bash
# ルートレベル共通依存関係
cd ../
npm install

# v209固有依存関係
cd v209/
npm install
```

### 3. ClaudeCode履歴同期設定
```bash
# 同期スクリプトを実行可能にする
chmod +x scripts/claude-history-sync.py

# 初回同期実行
python scripts/claude-history-sync.py
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## プロジェクト構造
```
v209/
├── .claude/                    # ClaudeCode設定
├── docs/                      # プロジェクト文書
│   ├── development/           # 開発標準・ガイドライン
│   ├── getting-started/       # セットアップガイド
│   └── technical/            # 技術仕様書
├── scripts/                   # ユーティリティスクリプト
│   └── claude-history-sync.py # 履歴同期スクリプト
├── src/                      # ソースコード
│   ├── css/                  # スタイルシート
│   ├── js/                   # JavaScript
│   └── index.html           # メインHTML
├── package.json              # プロジェクト設定
└── NextAction_250811.txt     # 作業記録
```

## 重要なファイル

### NextAction_250811.txt
本日の作業内容と次回作業時の推奨手順が記載された重要なファイルです。

### scripts/claude-history-sync.py
ClaudeCode履歴の30日自動削除対策として作成されたPythonスクリプトです。週1回以上の実行を推奨します。

## トラブルシューティング

### 履歴同期エラー
```bash
# 権限エラーの場合
chmod +x scripts/claude-history-sync.py

# Pythonパスエラーの場合
python3 scripts/claude-history-sync.py
```

### Git push エラー
大きなファイル（>100MB）がある場合：
```bash
# .gitignoreを確認
cat .gitignore

# 大きなファイルを除外
git rm --cached [large-file]
```