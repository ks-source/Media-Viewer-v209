# 環境依存リスク

## 概要

AI実行環境（ClaudeCode等）に固有の制約や設定に関する問題を記録し、対処法を提供します。環境の非永続性、設定の不整合、権限問題等を体系的に管理します。

## 主要リスク分類

### 🛤️ PATH設定・コマンド認識問題

#### GitHub CLI アクセス問題

**問題の概要**
```yaml
症状:
  - "gh: command not found" エラー
  - 前回は動作していたが今回はアクセス不可
  - ~/.local/bin/gh ファイルは存在

根本原因:
  - ClaudeCodeの各Bashコマンドは独立した非対話的シェルで実行
  - ~/.profile, ~/.bashrc が自動読み込みされない
  - PATH に ~/.local/bin が含まれない

影響度: 高（GitHub Project管理ができない）
```

**解決策**
```bash
# 即座の対処法（毎回実行）
export PATH="$HOME/.local/bin:$PATH"
gh auth status  # 認証確認

# または、プロファイル読み込み
source ~/.profile && gh auth status
```

**予防策**
```bash
# 1. 常に明示的なPATH設定を含める
export PATH="$HOME/.local/bin:$PATH" && gh <command>

# 2. 実行前チェックスクリプト
check_gh_access() {
    if ! command -v gh &> /dev/null; then
        export PATH="$HOME/.local/bin:$PATH"
    fi
    gh auth status
}

# 3. aliasまたはwrapper関数の作成
alias gh='export PATH="$HOME/.local/bin:$PATH" && gh'
```

**検証手順**
```bash
# 1. インストール確認
ls -la ~/.local/bin/gh

# 2. PATH確認
echo $PATH | grep -o "local/bin" || echo "PATH設定が必要"

# 3. 認証状態確認
export PATH="$HOME/.local/bin:$PATH"
gh auth status

# 4. 動作テスト
gh repo list --limit 1
```

#### その他のコマンドラインツール

**共通パターン**
- npm, node, python等のユーザーインストールツール
- ~/.local/bin, ~/bin 配下のカスタムスクリプト
- conda, nvm等の環境管理ツール

**汎用対処法**
```bash
# PATH確認・設定テンプレート
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# 環境管理ツールの初期化
[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
[ -s "$HOME/.bashrc" ] && source "$HOME/.bashrc"
```

### 🔐 認証・権限管理問題

#### SSH鍵・認証情報の管理

**問題パターン**
```yaml
セッション間の認証情報喪失:
  症状: 前回認証していたのに再認証要求
  原因: 一時的な認証トークンの期限切れ
  対処: 再認証またはトークン更新

権限不足エラー:
  症状: Permission denied, Access forbidden
  原因: ファイル権限、API権限スコープ不足
  対処: 権限確認・適切な権限付与
```

**GitHub認証の管理**
```bash
# 1. 認証状態確認
gh auth status

# 2. 必要なスコープ確認
# project, read:org, repo, workflow が必要

# 3. 再認証手順
gh auth login --scopes "project,read:org,repo,workflow"

# 4. トークン更新
gh auth refresh
```

**ファイル権限問題**
```bash
# 権限確認
ls -la <file_path>

# 一般的な権限修正
chmod 644 <file>      # 読み書き可能にする
chmod 755 <directory> # ディレクトリをアクセス可能にする
chmod +x <script>     # 実行権限を追加

# 所有者確認・変更（必要な場合のみ）
chown $USER:$USER <file>
```

### 🗂️ ファイルシステム・パス問題

#### Windows Subsystem for Linux (WSL) 固有問題

**パス変換問題**
```yaml
症状:
  - Windows パス (C:\Users\...) と Linux パス (/mnt/c/...) の混在
  - ファイルアクセス時のパス解決エラー
  - 相対パス・絶対パスの不整合

対処法:
  - 常に絶対パスを使用
  - WSL内では /mnt/c/... 形式で統一
  - wslpath コマンドでパス変換
```

**具体的な対処例**
```bash
# パス変換
wslpath -u "C:\Users\username\file.txt"  # → /mnt/c/Users/username/file.txt
wslpath -w "/mnt/c/Users/username/file.txt"  # → C:\Users\username\file.txt

# 現在のディレクトリ確認
pwd
ls -la

# 絶対パスでの操作
cd /mnt/c/Users/ks/Documents/Github_clone/Code/HTML/Media-Viewer/v209
```

#### ファイル名・文字エンコーディング問題

**問題パターン**
```yaml
日本語ファイル名:
  問題: 文字化け、アクセス不可
  対処: ASCII文字のみのファイル名使用推奨

改行コード問題:
  問題: CRLF vs LF の不整合
  対処: git config core.autocrlf の設定

特殊文字・スペース:
  問題: パス内のスペースや特殊文字
  対処: クォーテーションで囲む
```

**対処例**
```bash
# スペースを含むパスの取り扱い
cd "/mnt/c/Users/ks/Documents/Github clone"  # クォーテーション必須

# ファイル名の安全な確認
ls -la | cat -v  # 制御文字可視化

# エンコーディング確認・変更
file <filename>  # ファイル種別確認
iconv -f SHIFT_JIS -t UTF-8 <input> > <output>  # 文字コード変換
```

### 🔄 プロセス・セッション管理問題

#### 非永続的シェル環境

**制約事項**
```yaml
ClaudeCode実行環境の特性:
  - 各Bashコマンドは独立したプロセス
  - 環境変数は次のコマンドに引き継がれない
  - 作業ディレクトリは保持されない
  - バックグラウンドプロセスは終了

影響:
  - export した変数が次回利用できない
  - cd でディレクトリ移動しても無効
  - サービス起動後に制御不可
  - Git操作の状態が引き継がれない
```

**回避策**
```bash
# 1. 単一コマンドで完結させる
export VAR=value && command_using_var

# 2. 絶対パスを常に使用
/full/path/to/command instead of cd && ./command

# 3. 設定ファイルの活用
echo "export VAR=value" >> ~/.bashrc
source ~/.bashrc && command

# 4. スクリプトファイル化
cat > temp_script.sh << 'EOF'
#!/bin/bash
export VAR=value
cd /target/directory
command_sequence
EOF
bash temp_script.sh

# 5. Git操作の確実な実行
git add . && git commit -m "message" && git push origin main
```

#### Git操作の状態管理問題

**問題の概要**
```yaml
症状:
  - git commitは成功するがgit pushが実行されない
  - ローカルコミットがリモートに反映されない
  - "ahead of origin" 状態が継続する

根本原因:
  - ClaudeCodeの各コマンドは独立プロセス
  - git addからgit pushまでの状態が保持されない
  - 手動でプッシュを忘れるリスク

影響度: 高（重要な実装がGitHubに反映されない）
```

**実例: AWS S3統合実装での発生事例**
```bash
# ❌ 問題のあるパターン
git add .                    # ✅ 成功（ファイルステージング）
git commit -m "AWS S3 impl"  # ✅ 成功（ローカルコミット）
# git push忘れ               # ❌ 実行漏れ（リモート未反映）

# 結果: GitHubで最新実装が見えない状態
```

**推奨解決策**
```bash
# ✅ 推奨パターン1: チェーン実行
git add . && git commit -m "message" && git push origin main

# ✅ 推奨パターン2: 確実な段階実行
git add .
git commit -m "message"
git status                    # ← 状態確認
git push origin main         # ← 必ず実行

# ✅ 推奨パターン3: プッシュ確認付き
git add . && git commit -m "message"
echo "Commit completed. Pushing to GitHub..."
git push origin main && echo "✅ Successfully pushed to GitHub"
```

**Git操作チェックリスト**
```bash
# 作業完了後の必須確認手順
check_git_status() {
    echo "=== Git Status Check ==="
    
    # 1. ローカル変更確認
    git status --porcelain
    
    # 2. コミット履歴確認
    git log --oneline -3
    
    # 3. リモート同期状態確認
    git status | grep -E "(ahead|behind|up to date)"
    
    # 4. プッシュが必要か判定
    if git status | grep -q "ahead of"; then
        echo "⚠️ WARNING: Local commits not pushed to remote"
        echo "Run: git push origin main"
    else
        echo "✅ Repository is up to date with remote"
    fi
}
```

**予防策**
```bash
# Git操作のエイリアス設定
alias git-safe-commit='git add . && git commit -m'
alias git-full-sync='git add . && git commit -m "$1" && git push origin main'

# 使用例
git-full-sync "Implement AWS S3 integration Phase 1"
```

#### メモリ・リソース制限

**想定される制限**
```yaml
メモリ使用量:
  - 大容量ファイルの一括処理制限
  - 同時実行プロセス数制限

実行時間:
  - 長時間実行コマンドのタイムアウト
  - バックアップ・同期処理の中断

ディスク容量:
  - 一時ファイルの蓄積
  - ログファイルの肥大化
```

**対処指針**
```bash
# 大容量ファイル処理時の分割
split -l 1000 large_file.txt chunk_  # 行数で分割
find . -size +100M  # 大容量ファイル検出

# プロセス監視・制限
timeout 300 long_running_command  # 5分でタイムアウト
ulimit -t 300  # CPU時間制限

# 一時ファイルクリーンアップ
trap 'rm -f temp_*' EXIT  # スクリプト終了時自動削除
```

## 環境確認チェックリスト

### 🔍 開発セッション開始時

```bash
#!/bin/bash
# セッション開始時チェックスクリプト

echo "=== AI開発環境チェック ==="

# 1. 基本環境情報
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "Shell: $SHELL"

# 2. PATH確認
echo "PATH includes:"
echo $PATH | tr ':' '\n' | grep -E "(local|home)" || echo "No user paths found"

# 3. 重要なコマンド確認
for cmd in git gh node npm python; do
    if command -v $cmd &> /dev/null; then
        echo "✓ $cmd: $(command -v $cmd)"
    else
        echo "✗ $cmd: not found"
    fi
done

# 4. GitHub認証確認
if command -v gh &> /dev/null; then
    gh auth status 2>/dev/null && echo "✓ GitHub authenticated" || echo "✗ GitHub auth required"
else
    export PATH="$HOME/.local/bin:$PATH"
    if command -v gh &> /dev/null; then
        gh auth status 2>/dev/null && echo "✓ GitHub authenticated (after PATH fix)" || echo "✗ GitHub auth required"
    else
        echo "✗ GitHub CLI not installed"
    fi
fi

# 5. ディスク容量確認
df -h . | tail -1 | awk '{print "Disk usage: " $3 "/" $2 " (" $5 ")"}'

echo "=== チェック完了 ==="
```

### 📋 定期メンテナンス項目

```bash
# 週次実行推奨
cleanup_environment() {
    # 一時ファイルクリーンアップ
    find /tmp -user $USER -mtime +7 -delete 2>/dev/null
    
    # ログファイル整理
    find ~/. -name "*.log" -size +50M -mtime +30 2>/dev/null
    
    # 不要なGitブランチクリーンアップ
    git branch --merged | grep -v "main\|master" | xargs -n 1 git branch -d 2>/dev/null
    
    # パッケージキャッシュクリーンアップ
    npm cache clean --force 2>/dev/null
    pip cache purge 2>/dev/null
}
```

## トラブルシューティング

### よくある問題と対処法

#### Q: コマンドが見つからない（command not found）
```bash
# A: PATH設定確認・修正
echo $PATH
export PATH="$HOME/.local/bin:$HOME/bin:/usr/local/bin:$PATH"
hash -r  # コマンドハッシュ更新
```

#### Q: 権限が拒否される（Permission denied）
```bash
# A: 権限・所有者確認
ls -la <file>
sudo chown $USER:$USER <file>  # 所有者変更
chmod u+rwx <file>  # ユーザー権限付与
```

#### Q: ファイルが存在しない（No such file or directory）
```bash
# A: パス・存在確認
pwd  # 現在ディレクトリ
ls -la  # ファイル一覧
find . -name "<filename>" 2>/dev/null  # ファイル検索
```

#### Q: 前回の設定が消えている
```bash
# A: 永続化確認・再設定
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 関連文書

- [API制限・制約](api-limitations.md) - 外部サービス制限
- [データ永続性リスク](data-persistence.md) - ファイル・データ管理
- [緩和戦略集](mitigation-strategies.md) - 包括的対策

## 更新履歴

| 日付 | 問題・対処法 | 検証状況 |
|------|-------------|----------|
| 2025-08-14 | GitHub CLI PATH問題 | 解決済み - export PATH方式で対処 |

---

**注意**: 新たな環境依存問題を発見した場合は、このドキュメントに追記し、対処法の有効性を検証してください。