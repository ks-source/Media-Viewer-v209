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

## 不可逆操作安全策

### 🚨 GitHub削除操作の完全防止システム

**三段階安全確認の実装**
```bash
#!/bin/bash
# irreversible_operation_guard.sh

# Level 1: 自動事前チェック
pre_operation_safety_check() {
    local operation="$1"
    local target="$2"
    local safety_score=100
    local alerts=()
    
    echo "=== 自動安全チェック ==="
    echo "Operation: $operation"
    echo "Target: $target"
    
    # 危険操作の検出
    case "$operation" in
        *"delete"*|*"rm -rf"*|*"--force"*)
            safety_score=0
            alerts+=("🔴 CRITICAL: Irreversible operation detected")
            ;;
        *"reset --hard"*|*"push --force"*)
            safety_score=20
            alerts+=("🟠 HIGH: Potentially destructive operation")
            ;;
    esac
    
    # GitHub Project分析
    if [[ "$target" =~ project.*[0-9]+ ]]; then
        local project_id=$(echo "$target" | grep -o '[0-9]\+')
        local item_count=$(gh project item-list "$project_id" --owner ks-source 2>/dev/null | wc -l)
        
        if [ "$item_count" -gt 0 ]; then
            safety_score=$((safety_score - 40))
            alerts+=("🔴 WARNING: Project contains $item_count items")
        else
            safety_score=$((safety_score - 10))
            alerts+=("🟡 NOTICE: Empty project detected")
        fi
    fi
    
    # バックアップ状態確認
    check_backup_availability "$target"
    local backup_status=$?
    if [ $backup_status -ne 0 ]; then
        safety_score=$((safety_score - 20))
        alerts+=("⚠️ WARNING: No recent backups found")
    fi
    
    # 結果判定
    echo "Safety Score: $safety_score/100"
    
    if [ ${#alerts[@]} -gt 0 ]; then
        echo "Active Alerts:"
        for alert in "${alerts[@]}"; do
            echo "  $alert"
        done
    fi
    
    # 安全性判定
    if [ $safety_score -lt 30 ]; then
        echo "❌ OPERATION BLOCKED - Critical risk detected"
        return 1
    elif [ $safety_score -lt 60 ]; then
        echo "⚠️ MANUAL CONFIRMATION REQUIRED"
        return 2
    else
        echo "✅ Operation cleared for execution"
        return 0
    fi
}

# Level 2: AI自己検証プロトコル
ai_self_validation() {
    local operation="$1"
    local target="$2"
    
    echo "=== AI自己検証プロトコル ==="
    
    # 操作内容の構造化説明
    echo "🤖 AI Operation Analysis:"
    echo "  Requested operation: $operation"
    echo "  Target resource: $target"
    echo "  Irreversibility: HIGH (cannot be undone)"
    
    # 影響範囲の分析
    analyze_operation_impact "$operation" "$target"
    
    # 代替手段の検討
    suggest_safer_alternatives "$operation" "$target"
    
    # リスク評価の数値化
    local risk_score=$(calculate_risk_score "$operation" "$target")
    echo "  Risk Score: $risk_score/100"
    
    if [ $risk_score -gt 80 ]; then
        echo "🚨 AI RECOMMENDATION: ABORT OPERATION"
        echo "  Reason: Extremely high risk of irreversible data loss"
        return 1
    elif [ $risk_score -gt 60 ]; then
        echo "⚠️ AI RECOMMENDATION: REQUIRE HUMAN APPROVAL"
        echo "  Reason: Significant risk requires careful consideration"
        return 2
    else
        echo "✅ AI ASSESSMENT: Operation appears safe to proceed"
        return 0
    fi
}

analyze_operation_impact() {
    local operation="$1"
    local target="$2"
    
    echo "  Impact Analysis:"
    
    case "$operation" in
        *"project delete"*)
            echo "    - Project structure will be permanently lost"
            echo "    - All custom fields and views will be deleted"
            echo "    - Item associations will be removed"
            echo "    - Project URL will become invalid"
            ;;
        *"repo delete"*)
            echo "    - All repository content will be permanently deleted"
            echo "    - Commit history will be lost forever"
            echo "    - Issues and PRs will be deleted"
            echo "    - Repository URL will become invalid"
            ;;
        *"rm -rf"*)
            echo "    - Files and directories will be permanently deleted"
            echo "    - No local backup mechanism available"
            echo "    - Recovery depends on external backups"
            ;;
    esac
}

suggest_safer_alternatives() {
    local operation="$1"
    local target="$2"
    
    echo "  Safer Alternatives:"
    
    case "$operation" in
        *"project delete"*)
            echo "    1. Rename project to indicate deprecated status"
            echo "    2. Archive project instead of deletion"
            echo "    3. Export project data before deletion"
            echo "    4. Move items to another project first"
            ;;
        *"repo delete"*)
            echo "    1. Archive repository instead of deletion"
            echo "    2. Transfer ownership to archive account"
            echo "    3. Create comprehensive backup first"
            echo "    4. Make repository private instead"
            ;;
        *"rm -rf"*)
            echo "    1. Move to temporary directory first"
            echo "    2. Create backup before deletion"
            echo "    3. Use selective deletion instead"
            echo "    4. Verify contents before deletion"
            ;;
    esac
}

calculate_risk_score() {
    local operation="$1"
    local target="$2"
    local score=0
    
    # 操作タイプによるベーススコア
    case "$operation" in
        *"project delete"*|*"repo delete"*) score=90 ;;
        *"rm -rf"*) score=70 ;;
        *"--force"*) score=60 ;;
        *) score=20 ;;
    esac
    
    # 対象の重要度による加算
    if [[ "$target" =~ project.*[0-9]+ ]]; then
        local project_id=$(echo "$target" | grep -o '[0-9]\+')
        local item_count=$(gh project item-list "$project_id" --owner ks-source 2>/dev/null | wc -l)
        score=$((score + item_count * 2))
    fi
    
    echo $score
}

# Level 3: 人間承認システム
human_confirmation_system() {
    local operation="$1"
    local target="$2"
    local risk_level="$3"
    
    echo "=== HUMAN CONFIRMATION REQUIRED ==="
    echo ""
    echo "🚨 CRITICAL OPERATION DETECTED 🚨"
    echo ""
    echo "Operation: $operation"
    echo "Target: $target"
    echo "Risk Level: $risk_level"
    echo ""
    
    # 詳細影響分析の表示
    show_detailed_impact_analysis "$target"
    
    # 復旧不可能性の強調
    echo "⚠️ CRITICAL WARNING:"
    echo "   This operation is COMPLETELY IRREVERSIBLE"
    echo "   GitHub does NOT provide any recovery mechanisms"
    echo "   Manual reconstruction may require HOURS or DAYS of work"
    echo ""
    
    # 多段階確認プロセス
    if ! perform_multi_stage_confirmation "$operation" "$target"; then
        echo "❌ Operation cancelled - confirmation failed"
        return 1
    fi
    
    # 最終待機期間
    echo "⏰ Final confirmation: Operation will proceed in 10 seconds..."
    echo "   Press Ctrl+C to abort NOW."
    
    for i in {10..1}; do
        echo "   Proceeding in $i seconds... (Ctrl+C to abort)"
        sleep 1
    done
    
    echo ""
    echo "✅ Human confirmation completed - Operation authorized"
    return 0
}

perform_multi_stage_confirmation() {
    local operation="$1"
    local target="$2"
    
    echo "Multi-stage confirmation required:"
    echo ""
    
    echo "Stage 1: Acknowledge irreversibility"
    echo "Type 'I UNDERSTAND THIS CANNOT BE UNDONE' to continue:"
    read -r confirmation1
    if [ "$confirmation1" != "I UNDERSTAND THIS CANNOT BE UNDONE" ]; then
        return 1
    fi
    
    echo ""
    echo "Stage 2: Verify target correctness"
    echo "Type the exact target name to confirm: $target"
    read -r confirmation2
    if [ "$confirmation2" != "$target" ]; then
        echo "Target mismatch: '$confirmation2' != '$target'"
        return 1
    fi
    
    echo ""
    echo "Stage 3: Accept full responsibility"
    echo "Type 'I ACCEPT FULL RESPONSIBILITY FOR DATA LOSS' to proceed:"
    read -r confirmation3
    if [ "$confirmation3" != "I ACCEPT FULL RESPONSIBILITY FOR DATA LOSS" ]; then
        return 1
    fi
    
    echo ""
    echo "All confirmation stages completed."
    return 0
}

# バックアップ可用性確認
check_backup_availability() {
    local target="$1"
    
    # GitHub Project バックアップ確認
    if [[ "$target" =~ project.*[0-9]+ ]]; then
        local project_id=$(echo "$target" | grep -o '[0-9]\+')
        local backup_dir="$HOME/.github-project-backups"
        
        if [ -d "$backup_dir" ]; then
            local recent_backup=$(find "$backup_dir" -name "project-${project_id}-*.json" -mtime -7 | head -1)
            if [ -n "$recent_backup" ]; then
                echo "✅ Recent backup found: $(basename "$recent_backup")"
                return 0
            else
                echo "❌ No recent backups found (older than 7 days)"
                return 1
            fi
        else
            echo "❌ Backup directory not found"
            return 1
        fi
    fi
    
    return 0
}
```

### 🔄 自動バックアップ統合システム

**操作前自動バックアップ**
```bash
#!/bin/bash
# pre_operation_backup_system.sh

create_pre_operation_backup() {
    local operation="$1"
    local target="$2"
    
    echo "=== 操作前自動バックアップ ==="
    
    case "$operation" in
        *"project delete"*)
            backup_github_project "$target"
            ;;
        *"repo delete"*)
            backup_repository "$target"
            ;;
        *"rm -rf"*)
            backup_local_directory "$target"
            ;;
    esac
}

backup_github_project() {
    local target="$1"
    local project_id=$(echo "$target" | grep -o '[0-9]\+')
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$HOME/.github-project-backups"
    
    mkdir -p "$backup_dir"
    
    echo "Creating emergency backup of project $project_id..."
    
    # GraphQL APIを使用した完全バックアップ
    if command -v node &>/dev/null && [ -f "github-project-backup.js" ]; then
        node github-project-backup.js "$project_id"
    else
        # フォールバック: 基本的なCLIバックアップ
        {
            echo "# Emergency Backup - Project $project_id"
            echo "# Created: $(date -Iseconds)"
            echo ""
            echo "## Project Info"
            gh project view "$project_id" --owner ks-source 2>/dev/null
            echo ""
            echo "## Project Items"
            gh project item-list "$project_id" --owner ks-source 2>/dev/null
        } > "$backup_dir/emergency-project-${project_id}-${timestamp}.md"
    fi
    
    echo "✅ Emergency backup created"
    return 0
}

backup_repository() {
    local target="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$HOME/.repository-backups"
    
    mkdir -p "$backup_dir"
    
    echo "Creating repository backup bundle..."
    
    if [ -d ".git" ]; then
        git bundle create "$backup_dir/repo-backup-${timestamp}.bundle" --all
        echo "✅ Git bundle backup created: repo-backup-${timestamp}.bundle"
    else
        echo "❌ Not a git repository - cannot create backup"
        return 1
    fi
    
    return 0
}

backup_local_directory() {
    local target="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$HOME/.local-backups"
    
    mkdir -p "$backup_dir"
    
    if [ -d "$target" ] || [ -f "$target" ]; then
        echo "Creating local backup of: $target"
        tar -czf "$backup_dir/local-backup-${timestamp}.tar.gz" "$target"
        echo "✅ Local backup created: local-backup-${timestamp}.tar.gz"
        return 0
    else
        echo "❌ Target not found: $target"
        return 1
    fi
}
```

### 🛠️ GitHub操作セーフモード実装

**包括的操作インターセプト**
```bash
#!/bin/bash
# github_safe_mode.sh

# GitHub CLI セーフモード wrapper
gh_safe() {
    local cmd="$1"
    shift
    local args=("$@")
    
    echo "🛡️ GitHub Safe Mode - Intercepting operation"
    
    # 危険操作の検出・分析
    case "$cmd" in
        "project")
            handle_project_operations "${args[@]}"
            ;;
        "repo")
            handle_repository_operations "${args[@]}"
            ;;
        "issue")
            handle_issue_operations "${args[@]}"
            ;;
        *)
            # 安全な操作はそのまま実行
            command gh "$cmd" "${args[@]}"
            ;;
    esac
}

handle_project_operations() {
    local subcmd="$1"
    shift
    local args=("$@")
    
    case "$subcmd" in
        "delete")
            echo "🚨 CRITICAL: Project deletion intercepted"
            
            # 三段階安全確認実行
            if pre_operation_safety_check "project delete" "$1"; then
                local safety_result=$?
                if [ $safety_result -eq 2 ]; then
                    # 人間承認が必要
                    if human_confirmation_system "project delete" "$1" "CRITICAL"; then
                        # バックアップ作成
                        create_pre_operation_backup "project delete" "$1"
                        
                        # 実際の削除実行
                        echo "Executing: gh project delete $1 ${args[@]:1}"
                        command gh project delete "$1" "${args[@]:1}"
                    fi
                fi
            fi
            ;;
        "edit")
            echo "✅ Safe operation: project edit"
            command gh project "$subcmd" "${args[@]}"
            ;;
        *)
            echo "✅ Safe operation: project $subcmd"
            command gh project "$subcmd" "${args[@]}"
            ;;
    esac
}

handle_repository_operations() {
    local subcmd="$1"
    shift
    local args=("$@")
    
    case "$subcmd" in
        "delete")
            echo "🚨 CRITICAL: Repository deletion blocked in safe mode"
            echo "Repository deletion is permanently disabled for AI operations"
            echo "If this is absolutely necessary, please:"
            echo "1. Disable safe mode: unset gh_safe"
            echo "2. Create comprehensive backup first"
            echo "3. Use GitHub web interface for additional confirmation"
            return 1
            ;;
        *)
            echo "✅ Safe operation: repo $subcmd"
            command gh repo "$subcmd" "${args[@]}"
            ;;
    esac
}

# セーフモードの有効化
enable_github_safe_mode() {
    echo "🛡️ Enabling GitHub Safe Mode..."
    
    # ghコマンドをセーフラッパーで置き換え
    alias gh='gh_safe'
    
    # 環境変数で状態を記録
    export GITHUB_SAFE_MODE=1
    export GITHUB_SAFE_MODE_TIMESTAMP=$(date -Iseconds)
    
    # セーフモード設定を永続化
    echo "alias gh='gh_safe'" >> ~/.ai_environment
    echo "export GITHUB_SAFE_MODE=1" >> ~/.ai_environment
    
    echo "✅ GitHub Safe Mode activated"
    echo "   All destructive operations will require additional confirmation"
    echo "   To disable: disable_github_safe_mode"
}

disable_github_safe_mode() {
    echo "⚠️ Disabling GitHub Safe Mode..."
    
    unalias gh 2>/dev/null || true
    unset GITHUB_SAFE_MODE
    unset GITHUB_SAFE_MODE_TIMESTAMP
    
    # 設定ファイルからも削除
    sed -i '/alias gh/d' ~/.ai_environment 2>/dev/null || true
    sed -i '/GITHUB_SAFE_MODE/d' ~/.ai_environment 2>/dev/null || true
    
    echo "⚠️ GitHub Safe Mode disabled - destructive operations are now allowed"
}

# 起動時にセーフモードを自動有効化
if [ -z "$GITHUB_SAFE_MODE" ]; then
    enable_github_safe_mode
fi
```

### 📊 操作監査・ログシステム

**AI操作の完全追跡**
```bash
#!/bin/bash
# ai_operation_audit.sh

AI_AUDIT_LOG="$HOME/.ai-operation-audit.log"

log_ai_operation() {
    local operation="$1"
    local target="$2"
    local result="$3"
    local risk_level="$4"
    
    local timestamp=$(date -Iseconds)
    local session_id=${AI_SESSION_ID:-$(uuidgen 2>/dev/null || echo "unknown")}
    
    # 構造化ログエントリ
    local log_entry=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "session_id": "$session_id",
  "operation": "$operation",
  "target": "$target",
  "result": "$result",
  "risk_level": "$risk_level",
  "safety_checks": {
    "pre_check": "$([ -n "$PRE_CHECK_RESULT" ] && echo "$PRE_CHECK_RESULT" || echo "not_performed")",
    "ai_validation": "$([ -n "$AI_VALIDATION_RESULT" ] && echo "$AI_VALIDATION_RESULT" || echo "not_performed")",
    "human_confirmation": "$([ -n "$HUMAN_CONFIRMATION_RESULT" ] && echo "$HUMAN_CONFIRMATION_RESULT" || echo "not_required")"
  },
  "backup_created": "$([ -n "$BACKUP_CREATED" ] && echo "true" || echo "false")",
  "environment": {
    "pwd": "$(pwd)",
    "user": "$(whoami)",
    "hostname": "$(hostname)"
  }
}
EOF
)
    
    echo "$log_entry" >> "$AI_AUDIT_LOG"
    
    # 高リスク操作の場合は即座にアラート
    if [ "$risk_level" = "CRITICAL" ] || [ "$risk_level" = "HIGH" ]; then
        send_risk_alert "$operation" "$target" "$result" "$risk_level"
    fi
}

send_risk_alert() {
    local operation="$1"
    local target="$2"
    local result="$3"
    local risk_level="$4"
    
    echo "🚨 HIGH-RISK OPERATION ALERT 🚨" | tee -a "$HOME/.ai-alerts.log"
    echo "Time: $(date)" | tee -a "$HOME/.ai-alerts.log"
    echo "Operation: $operation" | tee -a "$HOME/.ai-alerts.log"
    echo "Target: $target" | tee -a "$HOME/.ai-alerts.log"
    echo "Result: $result" | tee -a "$HOME/.ai-alerts.log"
    echo "Risk Level: $risk_level" | tee -a "$HOME/.ai-alerts.log"
    echo "---" | tee -a "$HOME/.ai-alerts.log"
}

# 監査レポート生成
generate_audit_report() {
    local period_days=${1:-7}
    local cutoff_date=$(date -d "${period_days} days ago" -Iseconds)
    
    echo "=== AI Operation Audit Report ==="
    echo "Period: Last $period_days days"
    echo "Generated: $(date)"
    echo ""
    
    if [ ! -f "$AI_AUDIT_LOG" ]; then
        echo "No audit log found"
        return 0
    fi
    
    # 高リスク操作の統計
    echo "High-Risk Operations:"
    grep -c '"risk_level": "CRITICAL"' "$AI_AUDIT_LOG" 2>/dev/null | sed 's/^/  Critical: /'
    grep -c '"risk_level": "HIGH"' "$AI_AUDIT_LOG" 2>/dev/null | sed 's/^/  High: /'
    
    echo ""
    echo "Operation Results:"
    grep -c '"result": "SUCCESS"' "$AI_AUDIT_LOG" 2>/dev/null | sed 's/^/  Successful: /'
    grep -c '"result": "BLOCKED"' "$AI_AUDIT_LOG" 2>/dev/null | sed 's/^/  Blocked: /'
    grep -c '"result": "FAILED"' "$AI_AUDIT_LOG" 2>/dev/null | sed 's/^/  Failed: /'
    
    echo ""
    echo "Recent High-Risk Operations:"
    grep '"risk_level": "CRITICAL\|HIGH"' "$AI_AUDIT_LOG" 2>/dev/null | tail -5 | \
        jq -r '"\(.timestamp) - \(.operation) on \(.target) - \(.result)"' 2>/dev/null || \
        echo "  (Unable to parse log entries)"
}

# 定期監査レポートの自動実行
schedule_audit_reports() {
    # 週次レポートのcron設定
    local cron_entry="0 9 * * 1 $(realpath "$0") generate_audit_report 7 >> $HOME/.ai-audit-reports.log"
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
    
    echo "✅ Weekly audit reports scheduled"
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