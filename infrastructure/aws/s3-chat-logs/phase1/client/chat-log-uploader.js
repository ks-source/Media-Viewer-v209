/**
 * AI Chat Log Uploader for Media Viewer v209
 * Handles secure upload of chat logs to AWS S3 via presigned URLs
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { URL } = require('url');

class ChatLogUploader {
    constructor(functionUrl, options = {}) {
        this.functionUrl = functionUrl;
        this.options = {
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
            ...options
        };
    }

    /**
     * Upload a chat log file to S3
     * @param {string} filePath - Path to the chat log file
     * @param {object} metadata - Additional metadata for the upload
     * @returns {Promise<object>} Upload result with S3 key and presigned URL details
     */
    async uploadChatLog(filePath, metadata = {}) {
        try {
            console.log(`Starting upload of chat log: ${filePath}`);
            
            // Validate file exists and is readable
            await this.validateFile(filePath);
            
            // Read file content
            const fileContent = await fs.readFile(filePath, 'utf8');
            const fileName = path.basename(filePath);
            
            // Generate presigned URL for upload
            const presignedData = await this.getPresignedUrl({
                action: 'upload',
                fileName: fileName,
                contentType: 'application/json',
                expiresIn: 3600 // 1 hour
            });

            console.log(`Generated presigned URL for: ${presignedData.s3Key}`);

            // Upload file content to S3
            const uploadResult = await this.uploadToS3(
                presignedData.presignedUrl,
                fileContent,
                'application/json'
            );

            console.log(`Successfully uploaded chat log to S3: ${presignedData.s3Key}`);

            return {
                success: true,
                s3Key: presignedData.s3Key,
                fileName: fileName,
                uploadTimestamp: presignedData.timestamp,
                fileSize: Buffer.byteLength(fileContent, 'utf8'),
                metadata: metadata
            };

        } catch (error) {
            console.error('Failed to upload chat log:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Upload chat log content directly (without file)
     * @param {string} content - Chat log content as string
     * @param {string} fileName - Desired file name
     * @param {object} metadata - Additional metadata
     * @returns {Promise<object>} Upload result
     */
    async uploadChatLogContent(content, fileName, metadata = {}) {
        try {
            console.log(`Starting upload of chat log content: ${fileName}`);
            
            // Generate presigned URL for upload
            const presignedData = await this.getPresignedUrl({
                action: 'upload',
                fileName: fileName,
                contentType: 'application/json',
                expiresIn: 3600
            });

            // Upload content to S3
            const uploadResult = await this.uploadToS3(
                presignedData.presignedUrl,
                content,
                'application/json'
            );

            console.log(`Successfully uploaded chat log content to S3: ${presignedData.s3Key}`);

            return {
                success: true,
                s3Key: presignedData.s3Key,
                fileName: fileName,
                uploadTimestamp: presignedData.timestamp,
                fileSize: Buffer.byteLength(content, 'utf8'),
                metadata: metadata
            };

        } catch (error) {
            console.error('Failed to upload chat log content:', error);
            throw new Error(`Content upload failed: ${error.message}`);
        }
    }

    /**
     * Validate that the file exists and is accessible
     * @param {string} filePath - Path to validate
     */
    async validateFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            if (!stats.isFile()) {
                throw new Error(`Path is not a file: ${filePath}`);
            }
            if (stats.size === 0) {
                throw new Error(`File is empty: ${filePath}`);
            }
            if (stats.size > 100 * 1024 * 1024) { // 100MB limit
                throw new Error(`File too large (>100MB): ${filePath}`);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${filePath}`);
            }
            throw error;
        }
    }

    /**
     * Get presigned URL from Lambda function
     * @param {object} params - Request parameters
     * @returns {Promise<object>} Presigned URL data
     */
    async getPresignedUrl(params) {
        const requestData = JSON.stringify(params);
        
        return new Promise((resolve, reject) => {
            const url = new URL(this.functionUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestData),
                    'User-Agent': 'MediaViewer-v209-ChatLogUploader/1.0'
                },
                timeout: this.options.timeout
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200) {
                            resolve(response);
                        } else {
                            reject(new Error(`Lambda function error: ${response.error || response.message}`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Lambda response: ${parseError.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.write(requestData);
            req.end();
        });
    }

    /**
     * Upload content to S3 using presigned URL
     * @param {string} presignedUrl - Presigned URL from Lambda
     * @param {string} content - Content to upload
     * @param {string} contentType - MIME type
     * @returns {Promise<object>} Upload result
     */
    async uploadToS3(presignedUrl, content, contentType) {
        return new Promise((resolve, reject) => {
            const url = new URL(presignedUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: 'PUT',
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': Buffer.byteLength(content, 'utf8'),
                    'User-Agent': 'MediaViewer-v209-ChatLogUploader/1.0'
                },
                timeout: this.options.timeout
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            etag: res.headers.etag
                        });
                    } else {
                        reject(new Error(`S3 upload failed: ${res.statusCode} ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`S3 upload request failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('S3 upload timeout'));
            });

            req.write(content);
            req.end();
        });
    }

    /**
     * Test the uploader with a sample chat log
     * @returns {Promise<object>} Test result
     */
    async runTest() {
        console.log('Running ChatLogUploader test...');
        
        const testChatLog = {
            sessionId: `test-session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            messages: [
                {
                    role: 'user',
                    content: 'Hello, this is a test message for AWS S3 integration.',
                    timestamp: new Date().toISOString()
                },
                {
                    role: 'assistant',
                    content: 'This is a test response from the AI assistant.',
                    timestamp: new Date().toISOString()
                }
            ],
            metadata: {
                version: 'v209',
                testRun: true,
                environment: 'development'
            }
        };

        const testContent = JSON.stringify(testChatLog, null, 2);
        const testFileName = `test-chat-log-${Date.now()}.json`;

        try {
            const result = await this.uploadChatLogContent(testContent, testFileName, {
                testMode: true,
                testTimestamp: new Date().toISOString()
            });

            console.log('Test completed successfully:', result);
            return result;
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    }
}

// CLI interface for testing
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node chat-log-uploader.js [options]

Options:
  --test              Run integration test
  --upload <file>     Upload specific file
  --function-url <url> Lambda function URL
  --help, -h          Show this help message

Environment Variables:
  LAMBDA_FUNCTION_URL   URL of the presigned URL generator Lambda function

Example:
  node chat-log-uploader.js --test
  node chat-log-uploader.js --upload ./chat-log.json
        `);
        process.exit(0);
    }

    const functionUrl = args[args.indexOf('--function-url') + 1] || process.env.LAMBDA_FUNCTION_URL;
    
    if (!functionUrl) {
        console.error('Error: Lambda function URL is required. Set LAMBDA_FUNCTION_URL environment variable or use --function-url option.');
        process.exit(1);
    }

    const uploader = new ChatLogUploader(functionUrl);

    if (args.includes('--test')) {
        uploader.runTest()
            .then((result) => {
                console.log('\n✅ Test completed successfully!');
                console.log('Upload details:', JSON.stringify(result, null, 2));
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n❌ Test failed:', error.message);
                process.exit(1);
            });
    } else if (args.includes('--upload')) {
        const fileIndex = args.indexOf('--upload') + 1;
        const filePath = args[fileIndex];
        
        if (!filePath) {
            console.error('Error: File path is required with --upload option.');
            process.exit(1);
        }

        uploader.uploadChatLog(filePath)
            .then((result) => {
                console.log('\n✅ Upload completed successfully!');
                console.log('Upload details:', JSON.stringify(result, null, 2));
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n❌ Upload failed:', error.message);
                process.exit(1);
            });
    } else {
        console.error('Error: Please specify --test or --upload option. Use --help for usage information.');
        process.exit(1);
    }
}

module.exports = ChatLogUploader;