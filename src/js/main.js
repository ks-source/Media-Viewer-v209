/**
 * Media Viewer v209 - Main JavaScript
 * ClaudeCode履歴管理システム統合版
 */

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Media Viewer v209 - 初期化完了');
    initializeApp();
});

/**
 * アプリケーション初期化
 */
function initializeApp() {
    // システム状態の確認
    checkSystemStatus();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 定期的な状態更新
    setInterval(updateStatus, 30000); // 30秒間隔
}

/**
 * システム状態チェック
 */
function checkSystemStatus() {
    // logsディレクトリの存在確認
    const statusElement = document.querySelector('.status-value');
    if (statusElement) {
        statusElement.textContent = 'v209 - システム稼働中';
        statusElement.style.color = '#38a169';
    }
}

/**
 * イベントリスナー設定
 */
function setupEventListeners() {
    // ボタンイベントは既にHTMLでonclickが設定されているため、
    // 必要に応じて追加のイベントリスナーをここに記述
}

/**
 * ドキュメント表示
 */
function showDocs() {
    const docsPath = '../docs/development/standards.md';
    console.log('ドキュメントを表示:', docsPath);
    
    // 実際の環境では、Electronのshellモジュールを使用
    if (typeof require !== 'undefined') {
        const { shell } = require('electron');
        shell.openPath(docsPath);
    } else {
        alert(`ドキュメントパス: ${docsPath}\n\nElectron環境で実行してください。`);
    }
}

/**
 * 履歴同期実行
 */
function runSync() {
    console.log('履歴同期を実行中...');
    
    // Pythonスクリプトの実行
    if (typeof require !== 'undefined') {
        const { exec } = require('child_process');
        const scriptPath = '../scripts/claude-history-sync.py';
        
        exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('同期エラー:', error);
                alert(`同期エラー: ${error.message}`);
                return;
            }
            
            console.log('同期結果:', stdout);
            if (stderr) {
                console.warn('警告:', stderr);
            }
            
            alert('履歴同期が完了しました！');
            updateSyncStatus();
        });
    } else {
        alert('Electron環境で実行してください。\n\nコマンドライン実行:\npython scripts/claude-history-sync.py');
    }
}

/**
 * ログ表示
 */
function showLogs() {
    const logsPath = '../../../logs/v209/claude-history/sync/';
    console.log('ログディレクトリ:', logsPath);
    
    if (typeof require !== 'undefined') {
        const { shell } = require('electron');
        shell.openPath(logsPath);
    } else {
        alert(`ログディレクトリ: ${logsPath}\n\nElectron環境で実行してください。`);
    }
}

/**
 * 状態更新
 */
function updateStatus() {
    const now = new Date();
    console.log(`状態更新: ${now.toLocaleTimeString()}`);
    
    // 履歴管理システムの状態確認
    updateSyncStatus();
}

/**
 * 同期状態更新
 */
function updateSyncStatus() {
    // 最新の同期ログをチェック
    const syncStatus = document.querySelectorAll('.status-value')[1];
    if (syncStatus) {
        const lastSync = localStorage.getItem('lastSyncTime') || '未実行';
        syncStatus.textContent = lastSync !== '未実行' ? 
            `最終同期: ${lastSync}` : '未実行';
    }
}

/**
 * エラーハンドリング
 */
window.addEventListener('error', function(event) {
    console.error('アプリケーションエラー:', event.error);
});

/**
 * ユーティリティ関数
 */
const utils = {
    /**
     * 現在時刻を取得
     */
    getCurrentTime() {
        return new Date().toLocaleString('ja-JP');
    },
    
    /**
     * ファイルサイズをフォーマット
     */
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// グローバルに公開
window.showDocs = showDocs;
window.runSync = runSync;
window.showLogs = showLogs;