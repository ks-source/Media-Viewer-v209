/**
 * Configuration Management for AWS S3 Chat Logs Integration
 * Media Viewer v209 - Phase 1
 */

const fs = require('fs');
const path = require('path');

class Config {
    constructor(environment = 'dev') {
        this.environment = environment;
        this.config = this.loadConfig();
    }

    /**
     * Load configuration from environment variables and config files
     * @returns {object} Configuration object
     */
    loadConfig() {
        const defaultConfig = {
            // AWS Configuration
            aws: {
                region: process.env.AWS_REGION || 'ap-northeast-1',
                s3: {
                    bucketNamePrefix: 'media-viewer-v209-chat-logs',
                    keyPrefix: 'chat-logs/',
                    serverSideEncryption: 'aws:kms'
                }
            },

            // Lambda Function Configuration
            lambda: {
                functionUrl: process.env.LAMBDA_FUNCTION_URL || '',
                timeout: parseInt(process.env.LAMBDA_TIMEOUT) || 30000,
                retryAttempts: parseInt(process.env.LAMBDA_RETRY_ATTEMPTS) || 3,
                retryDelay: parseInt(process.env.LAMBDA_RETRY_DELAY) || 1000
            },

            // Upload Configuration
            upload: {
                maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
                allowedContentTypes: ['application/json', 'text/plain'],
                presignedUrlExpiry: parseInt(process.env.PRESIGNED_URL_EXPIRY) || 3600, // 1 hour
                compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',
                encryptionRequired: process.env.ENCRYPTION_REQUIRED !== 'false'
            },

            // Client Configuration
            client: {
                userAgent: 'MediaViewer-v209-ChatLogUploader/1.0',
                connectTimeout: parseInt(process.env.CONNECT_TIMEOUT) || 30000,
                readTimeout: parseInt(process.env.READ_TIMEOUT) || 60000,
                maxConcurrentUploads: parseInt(process.env.MAX_CONCURRENT_UPLOADS) || 3
            },

            // Logging Configuration
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                enableConsole: process.env.LOG_CONSOLE !== 'false',
                enableFile: process.env.LOG_FILE === 'true',
                logDirectory: process.env.LOG_DIRECTORY || './logs'
            },

            // Development Configuration
            development: {
                skipSSLVerification: process.env.SKIP_SSL_VERIFICATION === 'true',
                enableDebugMode: process.env.DEBUG_MODE === 'true',
                mockAWSServices: process.env.MOCK_AWS === 'true'
            }
        };

        // Environment-specific overrides
        const envOverrides = this.getEnvironmentOverrides();
        
        // Merge configurations
        return this.mergeDeep(defaultConfig, envOverrides);
    }

    /**
     * Get environment-specific configuration overrides
     * @returns {object} Environment overrides
     */
    getEnvironmentOverrides() {
        const overrides = {
            dev: {
                logging: {
                    level: 'debug',
                    enableConsole: true
                },
                development: {
                    enableDebugMode: true
                }
            },
            staging: {
                aws: {
                    region: 'ap-northeast-1'
                },
                logging: {
                    level: 'info',
                    enableFile: true
                }
            },
            prod: {
                aws: {
                    region: 'ap-northeast-1'
                },
                logging: {
                    level: 'warn',
                    enableFile: true,
                    enableConsole: false
                },
                development: {
                    skipSSLVerification: false,
                    enableDebugMode: false,
                    mockAWSServices: false
                }
            }
        };

        return overrides[this.environment] || {};
    }

    /**
     * Deep merge two objects
     * @param {object} target Target object
     * @param {object} source Source object
     * @returns {object} Merged object
     */
    mergeDeep(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Get configuration value by path
     * @param {string} path Dot-separated path (e.g., 'aws.s3.bucketNamePrefix')
     * @param {*} defaultValue Default value if path not found
     * @returns {*} Configuration value
     */
    get(path, defaultValue = undefined) {
        const keys = path.split('.');
        let current = this.config;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }

    /**
     * Set configuration value by path
     * @param {string} path Dot-separated path
     * @param {*} value Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Validate required configuration
     * @throws {Error} If required configuration is missing
     */
    validate() {
        const required = [
            'lambda.functionUrl',
            'aws.region'
        ];

        const missing = [];
        
        for (const path of required) {
            if (!this.get(path)) {
                missing.push(path);
            }
        }

        if (missing.length > 0) {
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }

        // Validate Lambda function URL format
        const functionUrl = this.get('lambda.functionUrl');
        if (functionUrl && !functionUrl.startsWith('https://')) {
            throw new Error('Lambda function URL must use HTTPS');
        }

        // Validate file size limits
        const maxFileSize = this.get('upload.maxFileSize');
        if (maxFileSize > 5 * 1024 * 1024 * 1024) { // 5GB AWS Lambda limit
            console.warn('Warning: Max file size exceeds AWS Lambda payload limit');
        }
    }

    /**
     * Get complete configuration object
     * @returns {object} Full configuration
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Export configuration for debugging
     * @param {boolean} includeSecrets Whether to include sensitive information
     * @returns {string} JSON string of configuration
     */
    export(includeSecrets = false) {
        const exportConfig = { ...this.config };
        
        if (!includeSecrets) {
            // Remove sensitive information
            if (exportConfig.lambda && exportConfig.lambda.functionUrl) {
                exportConfig.lambda.functionUrl = '[REDACTED]';
            }
        }
        
        return JSON.stringify(exportConfig, null, 2);
    }

    /**
     * Load configuration from file
     * @param {string} filePath Path to configuration file
     */
    loadFromFile(filePath) {
        try {
            const configData = fs.readFileSync(filePath, 'utf8');
            const fileConfig = JSON.parse(configData);
            this.config = this.mergeDeep(this.config, fileConfig);
        } catch (error) {
            console.warn(`Warning: Could not load config file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Save configuration to file
     * @param {string} filePath Path to save configuration
     * @param {boolean} includeSecrets Whether to include sensitive information
     */
    saveToFile(filePath, includeSecrets = false) {
        try {
            const configData = this.export(includeSecrets);
            fs.writeFileSync(filePath, configData, 'utf8');
        } catch (error) {
            throw new Error(`Failed to save config to ${filePath}: ${error.message}`);
        }
    }
}

// Environment detection
function detectEnvironment() {
    if (process.env.NODE_ENV) {
        return process.env.NODE_ENV;
    }
    
    if (process.env.ENVIRONMENT) {
        return process.env.ENVIRONMENT;
    }
    
    // Try to detect from hostname or other indicators
    const hostname = process.env.HOSTNAME || '';
    if (hostname.includes('prod')) return 'prod';
    if (hostname.includes('staging')) return 'staging';
    
    return 'dev';
}

// Default export
module.exports = Config;

// Named exports
module.exports.Config = Config;
module.exports.detectEnvironment = detectEnvironment;

// Singleton instance for convenience
module.exports.config = new Config(detectEnvironment());

// CLI interface for configuration management
if (require.main === module) {
    const args = process.argv.slice(2);
    const config = new Config(detectEnvironment());
    
    if (args.includes('--validate')) {
        try {
            config.validate();
            console.log('✅ Configuration is valid');
        } catch (error) {
            console.error('❌ Configuration validation failed:', error.message);
            process.exit(1);
        }
    } else if (args.includes('--export')) {
        const includeSecrets = args.includes('--include-secrets');
        console.log(config.export(includeSecrets));
    } else if (args.includes('--get')) {
        const pathIndex = args.indexOf('--get') + 1;
        const path = args[pathIndex];
        if (path) {
            const value = config.get(path);
            console.log(value !== undefined ? value : 'undefined');
        } else {
            console.error('Error: Path required with --get option');
            process.exit(1);
        }
    } else {
        console.log(`
Configuration Management Utility

Usage: node config.js [options]

Options:
  --validate              Validate configuration
  --export                Export configuration as JSON
  --include-secrets       Include sensitive information in export
  --get <path>            Get specific configuration value

Environment: ${detectEnvironment()}

Examples:
  node config.js --validate
  node config.js --export
  node config.js --get lambda.functionUrl
        `);
    }
}