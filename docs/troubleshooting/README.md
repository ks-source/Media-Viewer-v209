# トラブルシューティング - Media Viewer v209

## よくある問題と解決策

### 🔥 緊急時対応
ClaudeCode履歴の消失リスクがある場合は、[claude-history-recovery.md](claude-history-recovery.md)を最優先で確認してください。

### 📋 問題カテゴリ

#### 1. ClaudeCode履歴関連
- **同期スクリプトエラー** → [claude-history-recovery.md](claude-history-recovery.md#同期スクリプトが実行できない)
- **履歴ディレクトリ未検出** → [claude-history-recovery.md](claude-history-recovery.md#claudecode履歴ディレクトリが見つからない)
- **ファイル破損・消失** → [claude-history-recovery.md](claude-history-recovery.md#履歴ファイルの破損)

#### 2. Git管理関連
- **大容量ファイルエラー** → [claude-history-recovery.md](claude-history-recovery.md#大容量ファイルによるgitエラー)
- **プッシュ失敗** → [../development/standards.md](../development/standards.md#git管理規則)
- **.gitignore設定** → [../getting-started/setup-guide.md](../getting-started/setup-guide.md#トラブルシューティング)

#### 3. 環境・設定関連
- **Python環境** → [../getting-started/setup-guide.md](../getting-started/setup-guide.md#前提条件)
- **権限問題** → [claude-history-recovery.md](claude-history-recovery.md#権限問題の解決)
- **パス設定** → [../technical/claude-history-system.md](../technical/claude-history-system.md#設定ファイル)

## 問題報告フォーマット

問題を報告する際は、以下の情報を含めてください：

```markdown
## 問題概要
[問題の簡潔な説明]

## 環境情報
- OS: [Windows 10/11, WSL2など]
- Python: [バージョン]
- Git: [バージョン]
- ClaudeCode: [インストール場所]

## 再現手順
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]

## エラーメッセージ
```
[エラーメッセージをここに貼り付け]
```

## 試行した対処法
- [試した方法1]
- [試した方法2]

## 期待される結果
[期待していた動作]

## 実際の結果  
[実際に起こった動作]
```

## エスカレーション

### レベル1: 基本的な問題
- ドキュメントの確認
- 基本コマンドの実行
- 設定ファイルの確認

### レベル2: 中級レベルの問題
- ログファイルの詳細分析
- 手動復旧作業
- 設定の再構成

### レベル3: 高度な問題
- システム全体の再構築
- データ復旧作業
- 外部サポートへの相談

## 予防措置

### 定期メンテナンス
- 週1回: 履歴同期の実行確認
- 月1回: システム全体のヘルスチェック
- 四半期: バックアップの整理・検証

### 監視ポイント
- ディスク容量
- 同期成功率
- エラーログの蓄積
- パフォーマンスの低下

## 参考リソース

### 内部文書
- [システム設計](../architecture/system-design.md)
- [技術仕様](../technical/claude-history-system.md)
- [開発標準](../development/standards.md)

### 外部リソース
- [Python公式ドキュメント](https://docs.python.org/)
- [Git公式ドキュメント](https://git-scm.com/doc)
- [GitHub制限事項](https://docs.github.com/en/repositories/working-with-files/managing-large-files)

---

**緊急時は [claude-history-recovery.md](claude-history-recovery.md) を最優先で確認してください！**