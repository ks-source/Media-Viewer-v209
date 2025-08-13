# システム設計 - Media Viewer v209

## 設計方針

### 1. v208継承ベース設計
- 既存の文書体系を完全継承
- 追加機能のモジュール化
- 互換性の維持

### 2. ClaudeCode履歴管理統合
- 30日自動削除対策の実装
- 非侵襲的な追加機能設計  
- 独立性の確保

### 3. Git管理最適化
- 大容量ファイル対策
- .gitignore戦略的設計
- サイズ制限対応

## システム全体構成

```
Media Viewer v209 システム構成図

┌─────────────────────────────────────────────────────────────────────┐
│                        v209 Project Root                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │
│  │      docs/      │  │    scripts/      │  │        src/         │ │
│  │   (文書管理)    │  │  (自動化処理)   │  │    (最小実装)       │ │
│  │                 │  │                  │  │                     │ │
│  │ • requirements  │  │ • claude-history │  │ • index.html        │ │
│  │ • development   │  │   -sync.py       │  │ • css/main.css      │ │
│  │ • architecture  │  │ • config/        │  │ • js/main.js        │ │
│  │ • technical     │  │                  │  │                     │ │
│  │ • troubleshoot  │  │                  │  │                     │ │
│  │ • templates     │  │                  │  │                     │ │
│  └─────────────────┘  └──────────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    External Dependencies                       │ │
│  │                                                                 │ │
│  │  ┌─────────────────┐      ┌──────────────────────────────────┐  │ │
│  │  │  ClaudeCode     │      │        Git Repository           │  │ │
│  │  │  Local History  │─────▶│      (GitHub Remote)           │  │ │
│  │  │                 │      │                                 │  │ │
│  │  │ • ~/.claude/    │      │ • Size Limit: 100MB/file       │  │ │
│  │  │ • AppData/      │      │ • .gitignore: **/logs/         │  │ │
│  │  └─────────────────┘      └──────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                   Local Storage Layer                          │ │
│  │                                                                 │ │
│  │    ../../logs/v209/claude-history/                             │ │
│  │    ├── native/     (JSONL原本)                                │ │
│  │    ├── processed/  (Markdown変換)                             │ │
│  │    ├── sync/       (同期ログ)                                 │ │
│  │    └── index/      (将来: 検索インデックス)                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. ドキュメント管理コンポーネント (docs/)

#### 構成要素
```
docs/
├── README.md                    # ドキュメントインデックス
├── requirements/                # 要件定義
│   ├── functional-requirements.md
│   ├── cross-version-integration/
│   └── README.md
├── development/                 # 開発関連
│   ├── standards.md            # 開発標準 (Section 7含む)
│   └── claude-history-management.md
├── architecture/               # アーキテクチャ
│   ├── system-design.md        # (このファイル)
│   ├── system-architecture.md
│   └── data-flow.md
├── technical/                  # 技術仕様
│   ├── claude-history-system.md
│   └── core-features.md
├── getting-started/            # セットアップ
│   ├── setup-guide.md
│   └── README.md
├── troubleshooting/           # トラブル解決
│   ├── claude-history-recovery.md
│   └── README.md
└── templates/                 # テンプレート
    └── claude-session-template.md
```

#### 設計原則
- **継承性**: v208文書構造の完全継承
- **拡張性**: 新機能用ドキュメントの追加
- **統一性**: Markdown形式での統一
- **アクセシビリティ**: 階層的な情報構造

### 2. スクリプト管理コンポーネント (scripts/)

#### 構成要素
```
scripts/
├── claude-history-sync.py      # メイン同期スクリプト
├── config/
│   ├── sync-config.json       # 同期設定
│   └── paths.json             # パス設定
├── utils/                     # ユーティリティ (将来)
│   ├── file-handler.py
│   └── converter.py
└── tests/                     # テスト (将来)
    └── test_sync.py
```

#### 設計パターン
- **単一責任原則**: 各スクリプトは特定の機能のみ実装
- **設定外部化**: JSONファイルによる設定管理
- **エラーハンドリング**: 包括的なエラー処理
- **ログ管理**: 詳細な処理履歴記録

### 3. 最小実装UI (src/)

#### 構成要素
```
src/
├── index.html                 # メインページ
├── css/
│   └── main.css              # スタイルシート
└── js/
    └── main.js               # JavaScript制御
```

#### 設計コンセプト
- **軽量設計**: 必要最小限の機能実装
- **レスポンシブ**: モバイル対応デザイン
- **直感性**: シンプルなユーザーインターフェース
- **拡張準備**: 将来の機能追加を考慮した構造

## データ管理設計

### 1. 階層化ストレージ

#### ローカルストレージ戦略
```
Storage Hierarchy:

Level 1: Active Data (Project Root)
├── Package Configuration (package.json)
├── Development Documents (docs/)
└── Scripts & Automation (scripts/)

Level 2: Backup Data (../../logs/)
├── Native Archives (native/)
├── Processed Archives (processed/)
└── Synchronization Logs (sync/)

Level 3: Git Management
├── Tracked Files (.gitignore未指定)
└── Ignored Files (**/logs/ による除外)
```

#### データフロー設計
```
Data Flow Architecture:

ClaudeCode → [同期スクリプト] → [ローカルアーカイブ]
    ↓              ↓                    ↓
[自動削除]    [Python処理]         [永続保存]
  (30日)      [エラー処理]         [Git除外]
             [ログ生成]
```

### 2. ファイル管理戦略

#### 命名規則
- **Session Files**: `v[version]-[uuid].jsonl`
- **Processed Files**: `claude-session-v[version]-[date]-[time]-[short-uuid].md`
- **Log Files**: `sync-log-[YYYYMMDD]-[HHMM].md`

#### サイズ管理
- **GitHub制限対応**: 100MB以上のファイル除外
- **警告レベル**: 50MB以上で警告表示
- **処理最適化**: ストリーミング処理による効率化

## セキュリティ設計

### 1. アクセス制御
```python
# ファイル権限設定
file_permissions = {
    'config_files': 0o600,      # rw-------
    'log_files': 0o644,         # rw-r--r--
    'script_files': 0o755,      # rwxr-xr-x
    'archive_dirs': 0o700       # rwx------
}
```

### 2. データ保護
- **ローカル処理**: 外部通信なし
- **権限最小化**: 必要最小限のアクセス権
- **監査ログ**: すべての操作を記録
- **暗号化準備**: 将来の暗号化対応準備

## 拡張性設計

### 1. 段階的拡張計画

#### Phase 1 (v210): 自動化強化
- **cron/タスクスケジューラ連携**
- **Webベース管理画面**
- **リアルタイム監視**

#### Phase 2 (v211): 高度機能
- **全文検索システム**
- **タグ管理システム**
- **統計・分析機能**

#### Phase 3 (v212): クラウド統合
- **クラウドストレージ連携**
- **複数デバイス同期**
- **チーム共有機能**

### 2. アーキテクチャ拡張ポイント

#### プラグインアーキテクチャ準備
```python
# 将来の拡張ポイント
plugin_interfaces = {
    'storage_backends': ['local', 'cloud', 'hybrid'],
    'conversion_formats': ['markdown', 'html', 'pdf'],
    'notification_methods': ['file', 'email', 'webhook'],
    'analysis_engines': ['keyword', 'sentiment', 'summary']
}
```

## 運用設計

### 1. デプロイメント戦略
- **段階的展開**: 機能ごとの段階的リリース
- **下位互換性**: v208との完全互換性維持
- **ロールバック対応**: 問題発生時の迅速な復旧

### 2. 監視・保守
- **ヘルスチェック**: システム状態の定期確認
- **パフォーマンス監視**: 処理時間・リソース使用量
- **エラー追跡**: 詳細なエラーログと対応履歴

### 3. ドキュメント管理
- **バージョン管理**: 文書の版数管理
- **更新履歴**: 変更内容の詳細記録
- **レビュー体制**: 文書品質の継続的改善

## 技術的制約・前提

### 1. プラットフォーム要件
- **OS**: Windows 10/11, WSL2対応
- **Python**: 3.8以上
- **Node.js**: v18以上 (将来のElectron対応)
- **Git**: 2.30以上

### 2. 外部依存関係
- **ClaudeCode**: ローカルインストール必須
- **GitHub**: リポジトリホスティング
- **WSL**: Windows環境での開発推奨

### 3. 設計上の制約
- **サイズ制限**: GitHub 100MBファイル制限
- **処理能力**: ローカル環境のリソース制約
- **権限**: 管理者権限不要での動作

この設計により、v209は安定した文書管理システムとClaudeCode履歴保護機能を提供し、将来の拡張に向けた堅固な基盤を構築します。