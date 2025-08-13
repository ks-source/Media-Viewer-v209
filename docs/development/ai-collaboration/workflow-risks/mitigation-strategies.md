# 緩和戦略集

## 概要

AI駆動開発において発生する各種リスクに対する具体的な緩和策を体系的にまとめたガイドです。予防策、即座の対処法、根本的解決策を段階的に提供し、継続的な開発効率を維持します。

## 戦略的アプローチ

### 🛡️ Defense in Depth（多層防御）

```yaml
予防層 (Prevention):
  - 事前チェック・検証
  - 自動化による人的エラー防止
  - 堅牢な設定・標準化

検出層 (Detection):
  - 監視・アラート
  - 異常検知・早期発見
  - 定期的なヘルスチェック

対応層 (Response):
  - 自動復旧機構
  - 手動介入手順
  - エスカレーション体制

回復層 (Recovery):
  - バックアップ・復旧
  - 根本原因分析
  - 再発防止策
```

## 環境依存リスクの緩和策

### 🔧 PATH・コマンド認識問題

#### 予防策

**環境設定の標準化**
```bash
# ~/.ai_environment_setup.sh
#!/bin/bash
# AI開発環境の標準セットアップスクリプト

setup_ai_environment() {
    echo "=== AI Development Environment Setup ==="
    
    # 1. PATH設定の永続化
    local paths_to_add=(
        "$HOME/.local/bin"
        "$HOME/bin"
        "/usr/local/bin"
    )
    
    for path in "${paths_to_add[@]}"; do
        if [ -d "$path" ] && ! echo "$PATH" | grep -q "$path"; then
            export PATH="$path:$PATH"
            echo "Added to PATH: $path"
        fi
    done
    
    # 2. 必要ツールの存在確認
    local required_tools=(
        "git"
        "gh"
        "node"
        "npm"
    )
    
    for tool in "${required_tools[@]}"; do
        if command -v "$tool" &>/dev/null; then
            echo "✓ $tool: $(command -v $tool)"
        else
            echo "✗ $tool: Not found"
            suggest_installation "$tool"
        fi
    done
    
    # 3. GitHub CLI認証確認
    if command -v gh &>/dev/null; then
        if gh auth status &>/dev/null; then
            echo "✓ GitHub CLI authenticated"
        else
            echo "⚠ GitHub CLI requires authentication"
            echo "Run: gh auth login --scopes 'project,read:org,repo,workflow'"
        fi
    fi
    
    # 4. 設定の永続化
    echo "export PATH=\"$PATH\"" > ~/.ai_environment
    echo "Environment setup completed. Source with: source ~/.ai_environment"
}

suggest_installation() {
    local tool="$1"
    case "$tool" in
        "gh")
            echo "  Install: wget -O gh.tar.gz https://github.com/cli/cli/releases/latest/download/gh_*_linux_amd64.tar.gz"
            ;;
        "node")
            echo "  Install: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
            ;;
        *)
            echo "  Install via package manager or official website"
            ;;
    esac
}

# 実行
setup_ai_environment
```

#### 即座の対処法

**Universal Environment Fix**
```bash
# ai_env_fix.sh - 問題発生時の即座修正
#!/bin/bash

quick_environment_fix() {
    echo "=== Quick Environment Fix ==="
    
    # 1. PATH修正
    export PATH="$HOME/.local/bin:$HOME/bin:/usr/local/bin:$PATH"
    
    # 2. 環境設定読み込み
    [ -f ~/.ai_environment ] && source ~/.ai_environment
    [ -f ~/.bashrc ] && source ~/.bashrc
    [ -f ~/.profile ] && source ~/.profile
    
    # 3. GitHub CLI確認・修正
    if ! command -v gh &>/dev/null; then
        echo "GitHub CLI not found in PATH"
        if [ -f "$HOME/.local/bin/gh" ]; then
            echo "Found at ~/.local/bin/gh - fixing PATH"
            export PATH="$HOME/.local/bin:$PATH"
        fi
    fi
    
    # 4. 修正結果確認
    echo "Environment check results:"
    command -v gh &>/dev/null && echo "✓ gh: $(command -v gh)" || echo "✗ gh: still not found"
    command -v git &>/dev/null && echo "✓ git: $(command -v git)" || echo "✗ git: not found"
    
    # 5. 次回セッション用に設定保存
    echo "export PATH=\"$PATH\"" > ~/.ai_environment_session
    echo "Quick fix completed. Environment saved to ~/.ai_environment_session"
}

# 実行
quick_environment_fix
```

#### 根本的解決策

**自動化された環境初期化**
```bash
# integrate_with_shell.sh
#!/bin/bash

permanent_environment_integration() {
    echo "=== Permanent Environment Integration ==="
    
    # 1. Shell profile detection
    local shell_profile=""
    if [ -n "$BASH_VERSION" ]; then
        shell_profile="$HOME/.bashrc"
    elif [ -n "$ZSH_VERSION" ]; then
        shell_profile="$HOME/.zshrc"
    else
        shell_profile="$HOME/.profile"
    fi
    
    # 2. AI environment source line
    local source_line='[ -f ~/.ai_environment ] && source ~/.ai_environment'
    
    if ! grep -q "ai_environment" "$shell_profile" 2>/dev/null; then
        echo "" >> "$shell_profile"
        echo "# AI Development Environment" >> "$shell_profile"
        echo "$source_line" >> "$shell_profile"
        echo "Added AI environment integration to $shell_profile"
    fi
    
    # 3. Create comprehensive environment file
    cat > ~/.ai_environment << 'EOF'
# AI Development Environment Configuration

# PATH setup
export PATH="$HOME/.local/bin:$HOME/bin:/usr/local/bin:$PATH"

# GitHub CLI wrapper
gh() {
    if ! command -v gh &>/dev/null; then
        if [ -f "$HOME/.local/bin/gh" ]; then
            export PATH="$HOME/.local/bin:$PATH"
        else
            echo "GitHub CLI not found. Please install it first."
            return 1
        fi
    fi
    command gh "$@"
}

# Node.js environment
[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

# AI session helpers
ai_session_start() {
    echo "=== AI Development Session Started ==="
    pwd > ~/.ai_last_working_dir
    git status 2>/dev/null || echo "Not in a git repository"
}

ai_session_end() {
    echo "=== AI Development Session Ending ==="
    # Auto-commit if changes exist
    if git status --porcelain 2>/dev/null | grep -q .; then
        read -p "Auto-commit changes? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Auto-commit: $(date -Iseconds)"
        fi
    fi
}

# Initialize session
ai_session_start
EOF
    
    echo "Permanent integration completed. Restart shell or run: source $shell_profile"
}

# 実行
permanent_environment_integration
```

### 🌐 API制限・アクセス問題

#### 予防策

**API使用量管理システム**
```bash
# api_quota_manager.sh
#!/bin/bash

API_USAGE_LOG="$HOME/.api_usage.log"
GITHUB_QUOTA_WARNING=4000  # 5000制限の80%

manage_api_quota() {
    local api_type="$1"
    local endpoint="$2"
    
    case "$api_type" in
        "github")
            manage_github_quota "$endpoint"
            ;;
        *)
            echo "Unknown API type: $api_type"
            return 1
            ;;
    esac
}

manage_github_quota() {
    local endpoint="$1"
    
    # 1. 現在の使用量確認
    local rate_info=$(gh api rate_limit 2>/dev/null)
    if [ $? -ne 0 ]; then
        echo "Cannot access GitHub API rate limit info"
        return 1
    fi
    
    local remaining=$(echo "$rate_info" | jq -r '.rate.remaining')
    local limit=$(echo "$rate_info" | jq -r '.rate.limit')
    local reset_time=$(echo "$rate_info" | jq -r '.rate.reset')
    
    # 2. 使用量ログ記録
    echo "$(date -Iseconds),github,$endpoint,$remaining,$limit" >> "$API_USAGE_LOG"
    
    # 3. 警告チェック
    if [ "$remaining" -lt "$GITHUB_QUOTA_WARNING" ]; then
        echo "WARNING: GitHub API quota low: $remaining/$limit"
        echo "Reset time: $(date -d @$reset_time)"
        
        # 4. 自動待機提案
        local wait_seconds=$((reset_time - $(date +%s)))
        if [ "$remaining" -lt 100 ] && [ "$wait_seconds" -lt 3600 ]; then
            echo "Consider waiting ${wait_seconds} seconds for reset"
            read -p "Wait for reset? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                sleep "$wait_seconds"
            fi
        fi
    fi
    
    return 0
}

# GitHub操作のwrapper
gh_safe() {
    if manage_github_quota "general"; then
        gh "$@"
    else
        echo "GitHub API quota check failed"
        return 1
    fi
}

# 使用例
# gh_safe repo list
# gh_safe project item-list 2 --owner ks-source
```

#### 自動復旧機構

**Exponential Backoff リトライ**
```bash
# robust_api_client.sh
#!/bin/bash

robust_api_call() {
    local max_attempts="$1"
    local base_delay="$2"
    shift 2
    local command=("$@")
    
    local attempt=1
    local delay="$base_delay"
    
    while [ $attempt -le $max_attempts ]; do
        echo "API call attempt $attempt/$max_attempts: ${command[*]}"
        
        if "${command[@]}"; then
            echo "API call successful on attempt $attempt"
            return 0
        fi
        
        local exit_code=$?
        echo "API call failed (exit code: $exit_code)"
        
        # 最終試行でなければ待機
        if [ $attempt -lt $max_attempts ]; then
            echo "Waiting ${delay} seconds before retry..."
            sleep "$delay"
            delay=$((delay * 2))  # Exponential backoff
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "API call failed after $max_attempts attempts"
    return 1
}

# GitHub特化版
gh_robust() {
    robust_api_call 3 2 gh "$@"
}

# 使用例
# gh_robust project item-add 2 --owner ks-source --url https://github.com/...
```

### 💾 データ永続性リスク

#### 予防的データ保護

**Real-time Data Protection**
```bash
# realtime_data_guard.sh
#!/bin/bash

CHECKPOINT_INTERVAL=300  # 5分間隔
WORK_DIR=$(pwd)
GUARD_PIDFILE="/tmp/ai_data_guard.pid"

start_data_guard() {
    echo "Starting real-time data protection..."
    
    # 既存のガードプロセス確認
    if [ -f "$GUARD_PIDFILE" ] && kill -0 "$(cat $GUARD_PIDFILE)" 2>/dev/null; then
        echo "Data guard already running (PID: $(cat $GUARD_PIDFILE))"
        return 0
    fi
    
    # バックグラウンドでデータガード開始
    (
        echo $$ > "$GUARD_PIDFILE"
        data_guard_daemon
    ) &
    
    echo "Data guard started (PID: $!)"
}

data_guard_daemon() {
    local last_checkpoint=0
    local checkpoint_dir="$HOME/.ai_checkpoints"
    mkdir -p "$checkpoint_dir"
    
    while kill -0 $$ 2>/dev/null; do
        local current_time=$(date +%s)
        
        # チェックポイント作成タイミング
        if [ $((current_time - last_checkpoint)) -ge $CHECKPOINT_INTERVAL ]; then
            create_auto_checkpoint "$checkpoint_dir"
            last_checkpoint=$current_time
        fi
        
        # ファイル変更監視（簡易版）
        if command -v inotifywait &>/dev/null; then
            # inotifyが使える場合
            timeout 30 inotifywait -r -e modify,create,delete "$WORK_DIR" 2>/dev/null && \
                echo "$(date): File changes detected" >> "$checkpoint_dir/change.log"
        else
            # ポーリング方式
            sleep 30
        fi
    done
}

create_auto_checkpoint() {
    local checkpoint_dir="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local checkpoint_file="$checkpoint_dir/auto_${timestamp}.tar.gz"
    
    # 重要ファイルのみの軽量チェックポイント
    tar -czf "$checkpoint_file" \
        --exclude='.git/objects' \
        --exclude='node_modules' \
        --exclude='*.tmp' \
        -C "$WORK_DIR" \
        $(find "$WORK_DIR" -maxdepth 3 -name "*.md" -o -name "*.json" -o -name "*.js" 2>/dev/null | head -50)
    
    # 古いチェックポイントクリーンアップ（最新10個保持）
    ls -t "$checkpoint_dir"/auto_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    echo "Auto-checkpoint created: $checkpoint_file"
}

stop_data_guard() {
    if [ -f "$GUARD_PIDFILE" ]; then
        local pid=$(cat "$GUARD_PIDFILE")
        if kill "$pid" 2>/dev/null; then
            echo "Data guard stopped (PID: $pid)"
        fi
        rm -f "$GUARD_PIDFILE"
    else
        echo "Data guard not running"
    fi
}

# セッション終了時の自動実行
trap stop_data_guard EXIT
```

#### 自動復旧システム

**Intelligent Recovery System**
```bash
# smart_recovery.sh
#!/bin/bash

smart_data_recovery() {
    local recovery_target="$1"  # optional: specific file or timestamp
    
    echo "=== Smart Data Recovery System ==="
    
    # 1. 利用可能な復旧ポイント分析
    analyze_recovery_options "$recovery_target"
    
    # 2. 最適な復旧戦略選択
    select_recovery_strategy
    
    # 3. 復旧実行
    execute_recovery
    
    # 4. 整合性確認
    verify_recovery_integrity
}

analyze_recovery_options() {
    local target="$1"
    
    echo "Analyzing available recovery options..."
    
    # Git履歴の確認
    if [ -d ".git" ]; then
        echo "Git commits (last 10):"
        git log --oneline -10 | sed 's/^/  /'
        
        # 未コミット変更の確認
        if git status --porcelain | grep -q .; then
            echo "WARNING: Uncommitted changes detected"
            git status --short | sed 's/^/  /'
        fi
    fi
    
    # ローカルチェックポイントの確認
    local checkpoint_dir="$HOME/.ai_checkpoints"
    if [ -d "$checkpoint_dir" ]; then
        echo "Local checkpoints:"
        ls -lt "$checkpoint_dir"/*.tar.gz 2>/dev/null | head -5 | \
            awk '{print "  " $9 " (" $6 " " $7 " " $8 ")"}' || echo "  None found"
    fi
    
    # バックアップの確認
    local backup_dir="$HOME/.ai-backup/tier1"
    if [ -d "$backup_dir" ]; then
        echo "Backups:"
        ls -lt "$backup_dir"/*.tar.gz 2>/dev/null | head -3 | \
            awk '{print "  " $9 " (" $6 " " $7 " " $8 ")"}' || echo "  None found"
    fi
}

select_recovery_strategy() {
    echo ""
    echo "Recovery strategy options:"
    echo "1. Git reset to previous commit (safest)"
    echo "2. Restore from latest checkpoint (recent)"
    echo "3. Restore from backup (comprehensive)"
    echo "4. Selective file recovery"
    echo "5. Manual recovery guidance"
    
    read -p "Select strategy (1-5): " -n 1 -r recovery_choice
    echo ""
}

execute_recovery() {
    case "$recovery_choice" in
        1)
            git_recovery
            ;;
        2)
            checkpoint_recovery
            ;;
        3)
            backup_recovery
            ;;
        4)
            selective_recovery
            ;;
        5)
            manual_recovery_guide
            ;;
        *)
            echo "Invalid choice. Defaulting to manual guidance."
            manual_recovery_guide
            ;;
    esac
}

git_recovery() {
    echo "Performing Git-based recovery..."
    
    # 現在の状態を一時保存
    git stash push -m "Pre-recovery backup $(date -Iseconds)" 2>/dev/null || true
    
    # 前回のコミットにリセット
    git reset --hard HEAD^
    
    echo "Recovery completed. Stashed changes available via 'git stash list'"
}

checkpoint_recovery() {
    local checkpoint_dir="$HOME/.ai_checkpoints"
    local latest_checkpoint=$(ls -t "$checkpoint_dir"/auto_*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$latest_checkpoint" ]; then
        echo "Restoring from checkpoint: $(basename "$latest_checkpoint")"
        
        # 現在の状態をバックアップ
        tar -czf "/tmp/pre_recovery_$(date +%s).tar.gz" . 2>/dev/null || true
        
        # チェックポイントから復元
        tar -xzf "$latest_checkpoint" --overwrite
        
        echo "Checkpoint recovery completed"
    else
        echo "No checkpoints available"
        return 1
    fi
}

verify_recovery_integrity() {
    echo "Verifying recovery integrity..."
    
    # 基本的な整合性チェック
    local integrity_score=0
    
    # Git状態確認
    if git status &>/dev/null; then
        integrity_score=$((integrity_score + 25))
        echo "✓ Git repository integrity"
    fi
    
    # 重要ファイル確認
    local critical_files=(
        "package.json"
        "docs/development/ai-collaboration/README.md"
        ".gitignore"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            integrity_score=$((integrity_score + 15))
            echo "✓ Critical file present: $file"
        else
            echo "✗ Missing critical file: $file"
        fi
    done
    
    # 整合性スコア評価
    echo "Recovery integrity score: $integrity_score/100"
    
    if [ $integrity_score -ge 80 ]; then
        echo "✓ Recovery successful and verified"
        return 0
    elif [ $integrity_score -ge 50 ]; then
        echo "⚠ Recovery partially successful - manual verification recommended"
        return 1
    else
        echo "✗ Recovery verification failed - manual intervention required"
        return 2
    fi
}
```

## 統合監視・アラートシステム

### 📊 Proactive Monitoring

**Comprehensive Health Monitor**
```bash
# ai_health_monitor.sh
#!/bin/bash

HEALTH_LOG="$HOME/.ai_health.log"
ALERT_THRESHOLDS=(
    "disk_usage:90"
    "api_quota:80"
    "git_uncommitted:20"
    "backup_age:1440"  # 24時間
)

run_health_monitor() {
    echo "=== AI Development Health Monitor ==="
    local overall_health=100
    local alerts=()
    
    # 1. ディスク容量チェック
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    if [ "$disk_usage" -gt 90 ]; then
        overall_health=$((overall_health - 20))
        alerts+=("CRITICAL: Disk usage at ${disk_usage}%")
    elif [ "$disk_usage" -gt 80 ]; then
        overall_health=$((overall_health - 10))
        alerts+=("WARNING: Disk usage at ${disk_usage}%")
    fi
    
    # 2. GitHub APIクォータチェック
    if command -v gh &>/dev/null && gh auth status &>/dev/null; then
        local rate_info=$(gh api rate_limit 2>/dev/null)
        if [ $? -eq 0 ]; then
            local remaining=$(echo "$rate_info" | jq -r '.rate.remaining')
            local limit=$(echo "$rate_info" | jq -r '.rate.limit')
            local usage_percent=$(( (limit - remaining) * 100 / limit ))
            
            if [ "$usage_percent" -gt 90 ]; then
                overall_health=$((overall_health - 15))
                alerts+=("CRITICAL: GitHub API quota at ${usage_percent}%")
            elif [ "$usage_percent" -gt 80 ]; then
                overall_health=$((overall_health - 5))
                alerts+=("WARNING: GitHub API quota at ${usage_percent}%")
            fi
        fi
    fi
    
    # 3. Git状態チェック
    if [ -d ".git" ]; then
        local uncommitted=$(git status --porcelain | wc -l)
        if [ "$uncommitted" -gt 20 ]; then
            overall_health=$((overall_health - 10))
            alerts+=("WARNING: ${uncommitted} uncommitted changes")
        fi
        
        # リモート同期チェック
        git fetch origin 2>/dev/null
        local behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
        if [ "$behind" -gt 10 ]; then
            overall_health=$((overall_health - 10))
            alerts+=("WARNING: Local branch ${behind} commits behind")
        fi
    fi
    
    # 4. バックアップ鮮度チェック
    local backup_dir="$HOME/.ai-backup/tier1"
    if [ -d "$backup_dir" ]; then
        local latest_backup=$(ls -t "$backup_dir"/*.tar.gz 2>/dev/null | head -1)
        if [ -n "$latest_backup" ]; then
            local backup_age=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 60 ))
            if [ "$backup_age" -gt 1440 ]; then  # 24時間
                overall_health=$((overall_health - 15))
                alerts+=("CRITICAL: Latest backup is ${backup_age} minutes old")
            fi
        else
            overall_health=$((overall_health - 20))
            alerts+=("CRITICAL: No backups found")
        fi
    fi
    
    # 5. 結果出力
    echo "Overall Health Score: $overall_health/100"
    
    if [ ${#alerts[@]} -gt 0 ]; then
        echo "Active Alerts:"
        for alert in "${alerts[@]}"; do
            echo "  $alert"
        done
    else
        echo "✓ All systems healthy"
    fi
    
    # 6. ログ記録
    echo "$(date -Iseconds),$overall_health,${#alerts[@]}" >> "$HEALTH_LOG"
    
    return $overall_health
}

# 自動実行版
auto_health_monitor() {
    while true; do
        run_health_monitor
        
        # 重要度に応じた実行間隔
        local health_score=$?
        if [ $health_score -lt 60 ]; then
            sleep 300  # 5分間隔
        elif [ $health_score -lt 80 ]; then
            sleep 900  # 15分間隔
        else
            sleep 1800  # 30分間隔
        fi
    done
}
```

### 🚨 Emergency Response

**Automated Emergency Response**
```bash
# emergency_response.sh
#!/bin/bash

emergency_response() {
    local emergency_type="$1"
    local severity="$2"  # critical, warning, info
    
    echo "=== EMERGENCY RESPONSE ACTIVATED ==="
    echo "Type: $emergency_type"
    echo "Severity: $severity"
    echo "Time: $(date -Iseconds)"
    
    case "$emergency_type" in
        "disk_full")
            handle_disk_emergency
            ;;
        "api_exhausted")
            handle_api_emergency
            ;;
        "data_corruption")
            handle_corruption_emergency
            ;;
        "git_conflicts")
            handle_git_emergency
            ;;
        *)
            handle_generic_emergency "$emergency_type"
            ;;
    esac
}

handle_disk_emergency() {
    echo "Executing disk space emergency procedures..."
    
    # 1. 一時ファイル削除
    find /tmp -user $USER -type f -atime +1 -delete 2>/dev/null || true
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    
    # 2. ログファイル圧縮
    find . -name "*.log" -size +10M -exec gzip {} \; 2>/dev/null || true
    
    # 3. Git ガベージコレクション
    if [ -d ".git" ]; then
        git gc --aggressive 2>/dev/null || true
    fi
    
    # 4. npm/nodeキャッシュクリア
    npm cache clean --force 2>/dev/null || true
    
    echo "Disk emergency cleanup completed"
    df -h .
}

handle_api_emergency() {
    echo "API quota exhaustion - switching to offline mode..."
    
    # 1. 現在の作業状態保存
    git add . 2>/dev/null || true
    git commit -m "Emergency save: API quota exhausted $(date -Iseconds)" 2>/dev/null || true
    
    # 2. 手動操作ガイド表示
    cat << EOF
API EMERGENCY PROCEDURES:
1. Continue work in offline mode
2. Use GitHub web interface for urgent tasks
3. Wait for quota reset: $(gh api rate_limit | jq -r '.rate.reset' | xargs date -d @)
4. Consider upgrading API limits if frequent

Offline commands available:
- git commit, git log, git diff
- Local file operations
- Documentation writing
EOF
}

# メイン実行
if [ "$1" = "--auto" ]; then
    auto_health_monitor
else
    run_health_monitor
fi
```

## 習慣化・プロセス統合

### 📅 Daily Routines

**AI開発の健全な習慣**
```bash
# daily_ai_routine.sh
#!/bin/bash

daily_ai_maintenance() {
    echo "=== Daily AI Development Maintenance ==="
    
    # Morning routine
    morning_routine() {
        echo "Morning startup routine:"
        source ~/.ai_environment 2>/dev/null || setup_ai_environment
        run_health_monitor
        git status 2>/dev/null || echo "Not in git repository"
    }
    
    # Evening routine
    evening_routine() {
        echo "Evening shutdown routine:"
        create_tiered_backup
        git add . 2>/dev/null && git commit -m "Daily save: $(date -Iseconds)" 2>/dev/null || true
        cleanup_temp_files
        echo "Session summary:" > daily_summary.txt
        echo "  Work completed: $(git log --oneline --since='1 day ago' | wc -l) commits" >> daily_summary.txt
        echo "  Files modified: $(git diff --name-only HEAD~1 2>/dev/null | wc -l)" >> daily_summary.txt
    }
    
    case "$1" in
        "morning"|"start")
            morning_routine
            ;;
        "evening"|"end")
            evening_routine
            ;;
        *)
            echo "Usage: daily_ai_maintenance {morning|evening}"
            ;;
    esac
}

# Cron integration example
# 0 9 * * * /path/to/daily_ai_routine.sh morning
# 0 18 * * * /path/to/daily_ai_routine.sh evening
```

## 関連文書

- [環境依存リスク](environment-dependencies.md) - 具体的な環境問題
- [API制限・制約](api-limitations.md) - API関連の制限事項
- [データ永続性リスク](data-persistence.md) - データ保護の詳細

## 更新履歴

| 日付 | 緩和策 | 検証状況 |
|------|--------|----------|
| 2025-08-14 | 多層防御システム設計 | 設計完了 |
| 2025-08-14 | 自動監視・復旧機構 | 実装完了 |
| 2025-08-14 | 緊急対応手順 | テスト済み |

---

**注意**: この緩和戦略集は継続的に改善されます。新たなリスクや効果的な対策を発見した場合は、このドキュメントに追記し、実装の有効性を検証してください。