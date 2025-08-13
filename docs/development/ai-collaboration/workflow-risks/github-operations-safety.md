# GitHub不可逆操作安全ガイド

## 概要

AI駆動開発（ClaudeCode等）において、GitHub上での不可逆的な操作による重大な損失を防止するための包括的安全管理ガイドです。従来の人間主体開発とは異なるAI特有のリスクを分析し、三段階安全確認システムと自動バックアップ戦略を提供します。

## 背景と重要性

### 🚨 AI駆動開発特有のリスク

**人間とAIの操作特性の違い**
```yaml
人間の操作:
  ✓ 直感的なリスク回避
  ✓ 「取り返しのつかない」感覚
  ✓ 慎重な確認・躊躇
  ✓ 文脈的な影響判断

AI（ClaudeCode等）の操作:
  ⚠️ 効率優先・高速実行
  ⚠️ 論理的判断（感情的ブレーキなし）
  ⚠️ 「指示された通り」の忠実実行
  ⚠️ コンテキスト外影響の考慮不足
  ⚠️ 復旧不可能性の軽視
```

**実際のリスクシナリオ**
- プロジェクトID誤認による意図しない削除
- 「空だから安全」という判断での重要プロジェクト削除
- 一時的な作業効率化のための破壊的操作
- バックアップ未確認での大胆な変更実行

### 🔥 GitHub不可逆操作の現実

**GitHubの基本設計思想**
```yaml
復旧機能の制限:
  - 削除操作は基本的に不可逆
  - 「ゴミ箱」機能は提供されていない
  - GitHubサポートでも原則復元不可
  - 有料プランでも復旧機能なし

影響する主要機能:
  - Projects v2（プロジェクト削除）
  - Repository管理（リポジトリ削除）
  - Issue/PR管理（削除・クローズ）
  - ブランチ管理（強制削除）
```

## 不可逆操作のリスクレベル分類

### 🔴 Level 4: 致命的（Critical）

**完全復旧不可能な操作**
```yaml
GitHub Projects:
  - gh project delete <id> --owner <owner>
  - プロジェクト自体の削除
  
Repository:
  - gh repo delete <owner>/<repo>
  - リポジトリ全体の削除
  
影響:
  - 数週間〜数ヶ月の作業が完全消失
  - プロジェクト管理履歴の永久喪失
  - チーム協業への致命的影響
  
対策必須度: ★★★★★
```

### 🟠 Level 3: 重大（High）

**復旧困難な操作**
```yaml
Git Operations:
  - git push --force
  - git reset --hard <commit> && git push --force
  - git branch -D <branch> && git push origin --delete <branch>
  
GitHub Issues/PRs:
  - 重要Issue/PRの削除・クローズ
  - 大量データの一括変更
  
影響:
  - 重要な履歴・データの部分的消失
  - 手動復旧に多大な時間を要する
  - データ整合性の破綻
  
対策必須度: ★★★★☆
```

### 🟡 Level 2: 中程度（Medium）

**復旧可能だが影響の大きい操作**
```yaml
File Operations:
  - 重要ディレクトリの削除（rm -rf docs/）
  - 設定ファイルの破壊的変更
  - 大容量ファイルの誤コミット
  
Project Management:
  - Issue/PRステータスの大量変更
  - ラベル・マイルストーンの削除
  
影響:
  - 作業の中断・遅延
  - 復旧作業の負荷
  - 一時的な混乱
  
対策必須度: ★★★☆☆
```

### 🟢 Level 1: 軽微（Low）

**容易に復旧可能な操作**
```yaml
Safe Operations:
  - 通常のcommit/push
  - Issue/PR作成・編集
  - ファイル編集・追加
  - ブランチ作成・マージ
  
影響:
  - 軽微な修正で解決
  - 最小限の時間損失
  
対策必須度: ★☆☆☆☆
```

## 三段階安全確認システム

### 🛡️ Level 1: 自動事前チェック（Pre-operation Safety Check）

**実装すべき自動チェック**
```bash
#!/bin/bash
# pre_operation_safety_check.sh

safety_check() {
    local operation="$1"
    local target="$2"
    local risk_level=""
    local safety_score=100
    
    echo "=== 自動安全チェック ==="
    
    # 1. 操作の危険度判定
    case "$operation" in
        *"delete"*|*"rm -rf"*|*"--force"*)
            risk_level="CRITICAL"
            safety_score=0
            ;;
        *"reset --hard"*|*"push --force"*)
            risk_level="HIGH"
            safety_score=20
            ;;
        *"close"*|*"archive"*)
            risk_level="MEDIUM"
            safety_score=50
            ;;
        *)
            risk_level="LOW"
            safety_score=80
            ;;
    esac
    
    # 2. 対象の重要度分析
    analyze_target_importance "$target"
    
    # 3. バックアップ状態確認
    check_backup_status "$target"
    
    # 4. 安全性総合評価
    echo "Risk Level: $risk_level"
    echo "Safety Score: $safety_score/100"
    
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

analyze_target_importance() {
    local target="$1"
    
    # GitHub Project重要度判定
    if [[ "$target" =~ project.*[0-9]+ ]]; then
        local project_id=$(echo "$target" | grep -o '[0-9]\+')
        local item_count=$(gh project item-list "$project_id" --owner ks-source 2>/dev/null | wc -l)
        
        echo "Project analysis: $item_count items found"
        
        if [ "$item_count" -gt 0 ]; then
            echo "🔴 WARNING: Project contains $item_count items"
            safety_score=$((safety_score - 40))
        else
            echo "🟡 NOTICE: Empty project detected"
            safety_score=$((safety_score - 10))
        fi
    fi
    
    # Git Repository重要度判定
    if [ -d ".git" ]; then
        local commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
        local uncommitted=$(git status --porcelain | wc -l)
        
        echo "Repository analysis: $commit_count commits, $uncommitted uncommitted changes"
        
        if [ "$commit_count" -gt 100 ] || [ "$uncommitted" -gt 10 ]; then
            echo "🔴 WARNING: Significant repository activity detected"
            safety_score=$((safety_score - 30))
        fi
    fi
}

check_backup_status() {
    local target="$1"
    
    echo "Backup status check:"
    
    # 最近のGitコミット確認
    if [ -d ".git" ]; then
        local last_commit=$(git log -1 --format="%cr" 2>/dev/null)
        echo "  Last commit: $last_commit"
        
        # 24時間以内のコミットがない場合は警告
        if ! git log --since="24 hours ago" --oneline | head -1 > /dev/null 2>&1; then
            echo "  ⚠️ No recent commits - backup may be stale"
            safety_score=$((safety_score - 15))
        fi
    fi
    
    # プロジェクトバックアップ確認
    local backup_dir="$HOME/.github-project-backups"
    if [ -d "$backup_dir" ]; then
        local recent_backup=$(find "$backup_dir" -name "*.json" -mtime -1 | head -1)
        if [ -n "$recent_backup" ]; then
            echo "  ✓ Recent project backup found"
        else
            echo "  ⚠️ No recent project backups found"
            safety_score=$((safety_score - 10))
        fi
    fi
}
```

### 🤖 Level 2: AI自己検証（AI Self-validation）

**AIによる操作再確認プロトコル**
```yaml
実装方針:
  1. 操作実行前の一時停止
  2. 操作内容の構造化説明
  3. 影響範囲の明示的分析
  4. 代替手段の検討・提案
  5. リスク評価の数値化

確認項目:
  - 操作の必要性・妥当性
  - 影響を受ける範囲の特定
  - 復旧可能性の評価
  - 代替アプローチの存在
  - バックアップの準備状況

出力例:
  "GitHub Project ID 2を削除しようとしています。
   このプロジェクトには5つのIssueが含まれており、削除すると復旧不可能です。
   代替案として、プロジェクト名の変更による識別はいかがでしょうか？"
```

### 👤 Level 3: 人間承認（Human Confirmation）

**高リスク操作の承認システム**
```bash
#!/bin/bash
# human_confirmation_system.sh

request_human_confirmation() {
    local operation="$1"
    local target="$2"
    local risk_level="$3"
    local estimated_impact="$4"
    
    echo "=== HUMAN CONFIRMATION REQUIRED ==="
    echo ""
    echo "🚨 CRITICAL OPERATION DETECTED 🚨"
    echo ""
    echo "Operation: $operation"
    echo "Target: $target"
    echo "Risk Level: $risk_level"
    echo "Estimated Impact: $estimated_impact"
    echo ""
    echo "This operation is IRREVERSIBLE and may cause significant data loss."
    echo ""
    
    # 詳細影響分析の表示
    show_detailed_impact_analysis "$target"
    
    # 復旧不可能性の明示
    echo "⚠️ IMPORTANT: This operation CANNOT be undone."
    echo "   GitHub does not provide recovery mechanisms for this type of operation."
    echo "   Manual reconstruction may require hours or days of work."
    echo ""
    
    # 代替案の提示
    suggest_alternatives "$operation" "$target"
    
    # 多段階確認
    echo "To proceed, please confirm the following:"
    echo ""
    
    echo "1. I understand this operation is irreversible: (type 'IRREVERSIBLE')"
    read -r confirmation1
    if [ "$confirmation1" != "IRREVERSIBLE" ]; then
        echo "❌ Operation cancelled - incorrect confirmation"
        return 1
    fi
    
    echo "2. I have verified the target is correct: (type 'VERIFIED')"
    read -r confirmation2
    if [ "$confirmation2" != "VERIFIED" ]; then
        echo "❌ Operation cancelled - target not verified"
        return 1
    fi
    
    echo "3. I accept full responsibility for data loss: (type 'ACCEPT')"
    read -r confirmation3
    if [ "$confirmation3" != "ACCEPT" ]; then
        echo "❌ Operation cancelled - responsibility not accepted"
        return 1
    fi
    
    # 最終確認（待機期間）
    echo ""
    echo "⏰ Final confirmation: Operation will proceed in 10 seconds..."
    echo "   Press Ctrl+C to abort."
    
    for i in {10..1}; do
        echo "   Proceeding in $i seconds..."
        sleep 1
    done
    
    echo ""
    echo "✅ Human confirmation completed - Operation authorized"
    return 0
}

show_detailed_impact_analysis() {
    local target="$1"
    
    echo "📊 DETAILED IMPACT ANALYSIS:"
    echo ""
    
    # GitHub Project分析
    if [[ "$target" =~ project.*[0-9]+ ]]; then
        local project_id=$(echo "$target" | grep -o '[0-9]\+')
        
        echo "Project Details:"
        gh project view "$project_id" --owner ks-source 2>/dev/null || echo "  Unable to retrieve project details"
        
        echo "Affected Items:"
        gh project item-list "$project_id" --owner ks-source 2>/dev/null || echo "  Unable to retrieve items"
    fi
    
    echo ""
}

suggest_alternatives() {
    local operation="$1"
    local target="$2"
    
    echo "🤔 SUGGESTED ALTERNATIVES:"
    echo ""
    
    case "$operation" in
        *"project delete"*)
            echo "1. Rename project to indicate it's deprecated"
            echo "2. Archive project instead of deletion"
            echo "3. Export project data before deletion"
            echo "4. Move items to another project"
            ;;
        *"repo delete"*)
            echo "1. Archive repository instead of deletion"
            echo "2. Transfer ownership to archive account"
            echo "3. Create final backup/export"
            ;;
        *"rm -rf"*)
            echo "1. Move to temporary directory first"
            echo "2. Create backup before deletion"
            echo "3. Use selective deletion instead"
            ;;
    esac
    
    echo ""
}
```

## 自動バックアップ戦略

### 📋 GitHub Projects自動バックアップ

**GraphQL APIによる完全エクスポート**
```javascript
// github-project-backup.js
const { GraphQLClient } = require('graphql-request');
const fs = require('fs').promises;
const path = require('path');

class GitHubProjectBackup {
    constructor(token, owner) {
        this.client = new GraphQLClient('https://api.github.com/graphql', {
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
        this.owner = owner;
        this.backupDir = path.join(process.env.HOME, '.github-project-backups');
    }

    async ensureBackupDirectory() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create backup directory:', error);
        }
    }

    async backupProject(projectId) {
        console.log(`🔄 Backing up project ${projectId}...`);
        
        try {
            // プロジェクト基本情報取得
            const projectData = await this.getProjectData(projectId);
            
            // アイテム一覧取得
            const items = await this.getProjectItems(projectId);
            
            // カスタムフィールド取得
            const fields = await this.getProjectFields(projectId);
            
            // ビュー設定取得
            const views = await this.getProjectViews(projectId);
            
            // 統合バックアップオブジェクト作成
            const backupData = {
                timestamp: new Date().toISOString(),
                project: projectData,
                items: items,
                fields: fields,
                views: views,
                metadata: {
                    backupVersion: '1.0',
                    totalItems: items.length,
                    owner: this.owner
                }
            };
            
            // バックアップファイル保存
            const filename = `project-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(this.backupDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
            
            console.log(`✅ Backup completed: ${filepath}`);
            console.log(`   Project: ${projectData.title}`);
            console.log(`   Items: ${items.length}`);
            console.log(`   Fields: ${fields.length}`);
            
            return { success: true, filepath, data: backupData };
            
        } catch (error) {
            console.error(`❌ Backup failed for project ${projectId}:`, error);
            return { success: false, error: error.message };
        }
    }

    async getProjectData(projectId) {
        const query = `
            query($owner: String!, $projectId: Int!) {
                user(login: $owner) {
                    projectV2(number: $projectId) {
                        id
                        title
                        shortDescription
                        readme
                        closed
                        public
                        createdAt
                        updatedAt
                        url
                    }
                }
            }
        `;
        
        const data = await this.client.request(query, {
            owner: this.owner,
            projectId: parseInt(projectId)
        });
        
        return data.user.projectV2;
    }

    async getProjectItems(projectId) {
        const query = `
            query($owner: String!, $projectId: Int!, $cursor: String) {
                user(login: $owner) {
                    projectV2(number: $projectId) {
                        items(first: 100, after: $cursor) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            nodes {
                                id
                                type
                                createdAt
                                updatedAt
                                content {
                                    ... on Issue {
                                        number
                                        title
                                        url
                                        state
                                        repository {
                                            name
                                            owner {
                                                login
                                            }
                                        }
                                    }
                                    ... on PullRequest {
                                        number
                                        title
                                        url
                                        state
                                        repository {
                                            name
                                            owner {
                                                login
                                            }
                                        }
                                    }
                                }
                                fieldValues(first: 50) {
                                    nodes {
                                        ... on ProjectV2ItemFieldTextValue {
                                            text
                                            field {
                                                ... on ProjectV2FieldCommon {
                                                    name
                                                }
                                            }
                                        }
                                        ... on ProjectV2ItemFieldSingleSelectValue {
                                            name
                                            field {
                                                ... on ProjectV2FieldCommon {
                                                    name
                                                }
                                            }
                                        }
                                        ... on ProjectV2ItemFieldDateValue {
                                            date
                                            field {
                                                ... on ProjectV2FieldCommon {
                                                    name
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
        
        let allItems = [];
        let cursor = null;
        let hasNextPage = true;
        
        while (hasNextPage) {
            const data = await this.client.request(query, {
                owner: this.owner,
                projectId: parseInt(projectId),
                cursor: cursor
            });
            
            const items = data.user.projectV2.items;
            allItems = allItems.concat(items.nodes);
            
            hasNextPage = items.pageInfo.hasNextPage;
            cursor = items.pageInfo.endCursor;
        }
        
        return allItems;
    }

    async getProjectFields(projectId) {
        const query = `
            query($owner: String!, $projectId: Int!) {
                user(login: $owner) {
                    projectV2(number: $projectId) {
                        fields(first: 50) {
                            nodes {
                                ... on ProjectV2Field {
                                    id
                                    name
                                    dataType
                                }
                                ... on ProjectV2SingleSelectField {
                                    id
                                    name
                                    dataType
                                    options {
                                        id
                                        name
                                        color
                                    }
                                }
                                ... on ProjectV2IterationField {
                                    id
                                    name
                                    dataType
                                    configuration {
                                        iterations {
                                            id
                                            title
                                            startDate
                                            duration
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
        
        const data = await this.client.request(query, {
            owner: this.owner,
            projectId: parseInt(projectId)
        });
        
        return data.user.projectV2.fields.nodes;
    }

    async getProjectViews(projectId) {
        const query = `
            query($owner: String!, $projectId: Int!) {
                user(login: $owner) {
                    projectV2(number: $projectId) {
                        views(first: 20) {
                            nodes {
                                id
                                name
                                layout
                                createdAt
                                updatedAt
                                filter
                                sortBy {
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                    direction
                                }
                                groupBy {
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                }
                                visibleFields {
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
        
        const data = await this.client.request(query, {
            owner: this.owner,
            projectId: parseInt(projectId)
        });
        
        return data.user.projectV2.views.nodes;
    }

    // 自動バックアップスケジューラ
    async scheduleBackups() {
        console.log('🕐 Starting scheduled backup system...');
        
        // 全プロジェクト一覧取得
        const projects = await this.listAllProjects();
        
        for (const project of projects) {
            try {
                await this.backupProject(project.number);
                
                // レート制限回避
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`Failed to backup project ${project.number}:`, error);
            }
        }
        
        // 古いバックアップクリーンアップ
        await this.cleanupOldBackups(30); // 30日以上古いバックアップを削除
    }

    async listAllProjects() {
        const query = `
            query($owner: String!) {
                user(login: $owner) {
                    projectsV2(first: 20) {
                        nodes {
                            number
                            title
                            closed
                        }
                    }
                }
            }
        `;
        
        const data = await this.client.request(query, { owner: this.owner });
        return data.user.projectsV2.nodes.filter(p => !p.closed);
    }

    async cleanupOldBackups(daysToKeep = 30) {
        try {
            const files = await fs.readdir(this.backupDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filepath = path.join(this.backupDir, file);
                    const stats = await fs.stat(filepath);
                    
                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(filepath);
                        console.log(`🗑️ Cleaned up old backup: ${file}`);
                    }
                }
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}

// 使用例
async function main() {
    const token = process.env.GITHUB_TOKEN;
    const owner = 'ks-source';
    
    const backup = new GitHubProjectBackup(token, owner);
    await backup.ensureBackupDirectory();
    
    // 特定プロジェクトのバックアップ
    if (process.argv[2]) {
        const projectId = process.argv[2];
        await backup.backupProject(projectId);
    } else {
        // 全プロジェクトの自動バックアップ
        await backup.scheduleBackups();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = GitHubProjectBackup;
```

### 🔄 自動復旧システム

**プロジェクト復元スクリプト**
```javascript
// github-project-restore.js
const GitHubProjectBackup = require('./github-project-backup');
const fs = require('fs').promises;

class GitHubProjectRestore extends GitHubProjectBackup {
    
    async restoreProject(backupFilepath, newProjectName = null) {
        console.log(`🔄 Restoring project from ${backupFilepath}...`);
        
        try {
            // バックアップデータ読み込み
            const backupData = JSON.parse(await fs.readFile(backupFilepath, 'utf8'));
            
            // 新プロジェクト作成
            const projectTitle = newProjectName || `${backupData.project.title} (Restored)`;
            const newProject = await this.createProject(projectTitle, backupData.project.shortDescription);
            
            console.log(`✅ New project created: ${newProject.title} (ID: ${newProject.number})`);
            
            // カスタムフィールド復元
            await this.restoreFields(newProject.id, backupData.fields);
            
            // アイテム復元
            await this.restoreItems(newProject.id, backupData.items);
            
            // ビュー復元
            await this.restoreViews(newProject.id, backupData.views);
            
            console.log(`🎉 Project restoration completed!`);
            console.log(`   New project URL: ${newProject.url}`);
            
            return { success: true, project: newProject };
            
        } catch (error) {
            console.error(`❌ Restoration failed:`, error);
            return { success: false, error: error.message };
        }
    }

    async createProject(title, description) {
        const mutation = `
            mutation($input: CreateProjectV2Input!) {
                createProjectV2(input: $input) {
                    projectV2 {
                        id
                        number
                        title
                        url
                    }
                }
            }
        `;
        
        const input = {
            ownerId: await this.getOwnerId(),
            title: title,
            repositoryId: null // User project
        };
        
        if (description) {
            input.shortDescription = description;
        }
        
        const data = await this.client.request(mutation, { input });
        return data.createProjectV2.projectV2;
    }

    async getOwnerId() {
        const query = `
            query($owner: String!) {
                user(login: $owner) {
                    id
                }
            }
        `;
        
        const data = await this.client.request(query, { owner: this.owner });
        return data.user.id;
    }

    async restoreFields(projectId, fields) {
        console.log(`🔧 Restoring ${fields.length} custom fields...`);
        
        for (const field of fields) {
            try {
                if (field.name === 'Title' || field.name === 'Assignees' || field.name === 'Status') {
                    // システムフィールドはスキップ
                    continue;
                }
                
                await this.createCustomField(projectId, field);
                console.log(`  ✓ Field restored: ${field.name}`);
                
                // レート制限回避
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`  ❌ Failed to restore field ${field.name}:`, error);
            }
        }
    }

    async createCustomField(projectId, fieldData) {
        let mutation, input;
        
        switch (fieldData.dataType) {
            case 'TEXT':
                mutation = `
                    mutation($input: CreateProjectV2FieldInput!) {
                        createProjectV2Field(input: $input) {
                            projectV2Field {
                                id
                                name
                            }
                        }
                    }
                `;
                input = {
                    projectId: projectId,
                    dataType: 'TEXT',
                    name: fieldData.name
                };
                break;
                
            case 'SINGLE_SELECT':
                mutation = `
                    mutation($input: CreateProjectV2FieldInput!) {
                        createProjectV2Field(input: $input) {
                            projectV2Field {
                                id
                                name
                            }
                        }
                    }
                `;
                input = {
                    projectId: projectId,
                    dataType: 'SINGLE_SELECT',
                    name: fieldData.name,
                    singleSelectOptions: fieldData.options?.map(opt => ({
                        name: opt.name,
                        color: opt.color,
                        description: opt.description || ""
                    })) || []
                };
                break;
                
            default:
                console.log(`  ⚠️ Unsupported field type: ${fieldData.dataType}`);
                return;
        }
        
        await this.client.request(mutation, { input });
    }

    async restoreItems(projectId, items) {
        console.log(`📋 Restoring ${items.length} items...`);
        
        for (const item of items) {
            try {
                if (item.content) {
                    await this.addItemToProject(projectId, item);
                    console.log(`  ✓ Item restored: ${item.content.title || item.content.number}`);
                }
                
                // レート制限回避
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`  ❌ Failed to restore item:`, error);
            }
        }
    }

    async addItemToProject(projectId, itemData) {
        // Issue/PRの場合はcontent URLから追加
        if (itemData.content && itemData.content.url) {
            const mutation = `
                mutation($input: AddProjectV2ItemByIdInput!) {
                    addProjectV2ItemById(input: $input) {
                        item {
                            id
                        }
                    }
                }
            `;
            
            const input = {
                projectId: projectId,
                contentId: itemData.content.id || await this.getContentIdFromUrl(itemData.content.url)
            };
            
            await this.client.request(mutation, { input });
        }
    }

    // 使用方法のサンプル
    static async emergencyRestore(backupPattern = null) {
        console.log('🚨 EMERGENCY RESTORATION MODE 🚨');
        
        const backup = new GitHubProjectRestore(process.env.GITHUB_TOKEN, 'ks-source');
        const backupDir = backup.backupDir;
        
        try {
            const files = await fs.readdir(backupDir);
            const backupFiles = files
                .filter(f => f.endsWith('.json'))
                .filter(f => backupPattern ? f.includes(backupPattern) : true)
                .sort()
                .reverse(); // 最新優先
            
            if (backupFiles.length === 0) {
                console.log('❌ No backup files found');
                return;
            }
            
            console.log('Available backups:');
            backupFiles.forEach((file, index) => {
                console.log(`  ${index + 1}. ${file}`);
            });
            
            // 最新バックアップから復元（または選択式）
            const selectedFile = backupFiles[0];
            const filepath = path.join(backupDir, selectedFile);
            
            console.log(`Restoring from: ${selectedFile}`);
            const result = await backup.restoreProject(filepath);
            
            if (result.success) {
                console.log('🎉 Emergency restoration completed successfully!');
            } else {
                console.log('❌ Emergency restoration failed');
            }
            
        } catch (error) {
            console.error('Emergency restoration error:', error);
        }
    }
}

module.exports = GitHubProjectRestore;
```

## 実装ガイドライン

### 🚀 段階的導入ロードマップ

#### Phase 1: 即座の安全強化（今週中）
```yaml
優先度: 緊急
実装内容:
  - 危険操作の明文化・分類
  - 基本的な事前確認スクリプト
  - 手動バックアップ手順の確立
  - ClaudeCodeの操作制約追加

成果物:
  - github-operations-safety.md（このドキュメント）
  - pre_operation_safety_check.sh
  - manual-backup-procedures.md
```

#### Phase 2: 自動化システム（1-2週間）
```yaml
優先度: 高
実装内容:
  - GraphQL APIバックアップシステム
  - 自動復旧スクリプト
  - 三段階安全確認の完全実装
  - GitHub Actions統合

成果物:
  - github-project-backup.js
  - github-project-restore.js  
  - automated-backup.yml（GitHub Actions）
  - safety-check-wrapper.sh
```

#### Phase 3: 統合・最適化（1ヶ月）
```yaml
優先度: 中
実装内容:
  - AI操作ログ・監査システム
  - 高度な影響分析
  - 組織レベル権限管理
  - 包括的復旧テスト

成果物:
  - ai-operation-audit.js
  - advanced-impact-analyzer.sh
  - organization-safety-policy.md
  - disaster-recovery-playbook.md
```

### 📋 運用統合

#### AI操作プロトコルの更新
```yaml
ClaudeCode操作時の新標準手順:
  1. 操作リスクの自動評価
  2. Level 3以上は人間承認必須
  3. バックアップ状態の事前確認
  4. 操作結果の検証・記録

実装方法:
  - wrapper関数による操作インターセプト
  - 環境変数による安全モード強制
  - ログ記録の自動化
```

#### GitHub CLI セーフモード
```bash
# ~/.ai_environment に追加
gh_safe() {
    local cmd="$1"
    shift
    
    # 危険操作チェック
    case "$cmd" in
        "project")
            case "$1" in
                "delete")
                    echo "🚨 CRITICAL OPERATION: Project deletion detected"
                    if ! pre_operation_safety_check "project delete" "$2"; then
                        echo "❌ Operation blocked by safety check"
                        return 1
                    fi
                    ;;
            esac
            ;;
        "repo")
            case "$1" in
                "delete")
                    echo "🚨 CRITICAL OPERATION: Repository deletion detected"
                    echo "❌ Repository deletion is blocked in safe mode"
                    return 1
                    ;;
            esac
            ;;
    esac
    
    # 実際のコマンド実行
    command gh "$cmd" "$@"
}

# ghコマンドをセーフモードで置き換え
alias gh='gh_safe'
```

## 緊急時対応手順

### 🚨 誤削除発生時の即座対応

#### 1. 被害範囲の確認（0-5分）
```bash
#!/bin/bash
# emergency-assessment.sh

assess_damage() {
    echo "=== EMERGENCY DAMAGE ASSESSMENT ==="
    echo "Timestamp: $(date -Iseconds)"
    
    # 削除されたプロジェクトの特定
    echo "Checking for missing projects..."
    gh project list --owner ks-source
    
    # 関連Issuesの状態確認
    echo "Checking related issues..."
    gh issue list --repo ks-source/Media-Viewer-v209 --state all
    
    # 最近のGitHubアクティビティ確認
    echo "Recent GitHub activity:"
    gh api user/events | head -20
    
    # バックアップ可用性確認
    echo "Available backups:"
    ls -la ~/.github-project-backups/ 2>/dev/null || echo "No backup directory found"
}
```

#### 2. 即座の復旧作業（5-30分）
```bash
#!/bin/bash
# emergency-recovery.sh

emergency_recovery() {
    local deleted_project_id="$1"
    
    echo "=== EMERGENCY RECOVERY INITIATED ==="
    
    # 1. バックアップから復旧
    if [ -f ~/.github-project-backups/project-${deleted_project_id}-*.json ]; then
        echo "🔄 Backup found - initiating automatic restore..."
        node github-project-restore.js ~/.github-project-backups/project-${deleted_project_id}-*.json
    fi
    
    # 2. 手動復旧（バックアップが利用できない場合）
    if [ $? -ne 0 ]; then
        echo "⚠️ Automatic restore failed - initiating manual recovery..."
        manual_project_recreation "$deleted_project_id"
    fi
    
    # 3. 関連Issues再関連付け
    echo "🔗 Re-linking issues to restored project..."
    relink_issues_to_project
    
    # 4. 検証・確認
    echo "✅ Verifying recovery completion..."
    verify_recovery_success
    
    echo "🎉 Emergency recovery completed"
}

manual_project_recreation() {
    local project_id="$1"
    
    echo "📝 Manual project recreation required"
    echo "Please perform the following steps:"
    echo ""
    echo "1. Create new project: 'Media Viewer v209 Roadmap (Restored)'"
    echo "2. Add the following issues:"
    
    # 想定されるIssue一覧
    local issues=(
        "https://github.com/ks-source/Media-Viewer-v209/issues/1"
        "https://github.com/ks-source/Media-Viewer-v209/issues/2" 
        "https://github.com/ks-source/Media-Viewer-v209/issues/3"
        "https://github.com/ks-source/Media-Viewer-v209/issues/4"
        "https://github.com/ks-source/Media-Viewer-v209/issues/5"
    )
    
    for issue in "${issues[@]}"; do
        echo "   - $issue"
    done
    
    echo ""
    echo "3. Configure project views and fields as needed"
    echo "4. Update project URL in documentation"
}
```

### 📋 事後分析・再発防止

#### 根本原因分析（RCA）
```yaml
分析項目:
  - 削除操作の具体的経緯
  - 安全チェックが働かなかった理由
  - AIの判断プロセスの問題点
  - システム制約の不備

改善策:
  - 安全チェックの強化
  - AI判断プロセスの改良
  - バックアップ頻度の見直し
  - 復旧手順の改善
```

## 関連文書・統合

### 📚 既存文書との連携

**更新対象文書:**
- [API制限・制約](api-limitations.md#github不可逆操作制限) - GitHub API特有の制限事項
- [緩和戦略集](mitigation-strategies.md#不可逆操作安全策) - 具体的な対策実装
- [環境依存リスク](environment-dependencies.md) - GitHub CLI操作の安全性

**新規参照先:**
- [データ永続性リスク](data-persistence.md) - バックアップ戦略との連携
- [プロジェクト管理ワークフロー](../project-management-workflow.md) - 安全な運用手順

### 🔄 継続的改善

#### 月次レビュー項目
- 危険操作の発生頻度・パターン分析
- 安全チェックの有効性評価
- バックアップシステムの動作確認
- 新たな脅威・リスクの特定

#### AI操作ログ分析
```bash
# AI操作の安全性分析
analyze_ai_operations() {
    local log_file="$HOME/.ai-operation-log"
    
    echo "=== AI Operation Safety Analysis ==="
    
    # 高リスク操作の頻度
    echo "High-risk operations in last 30 days:"
    grep -c "RISK:HIGH\|RISK:CRITICAL" "$log_file" 2>/dev/null || echo "0"
    
    # ブロックされた操作
    echo "Blocked operations:"
    grep "BLOCKED" "$log_file" 2>/dev/null | tail -5
    
    # 成功した復旧
    echo "Successful recoveries:"
    grep "RECOVERY:SUCCESS" "$log_file" 2>/dev/null | wc -l
}
```

## 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025-08-14 | 初版作成 - GitHub不可逆操作の包括的安全管理 | ClaudeCode |

---

**緊急連絡先**: このドキュメントに記載された手順で解決できない重大な問題が発生した場合は、プロジェクト管理者に即座に連絡してください。

**定期更新**: このドキュメントは月次でレビューし、新たなリスクや改善策を反映します。AI技術の進歩に応じて、安全策も継続的に発展させます。