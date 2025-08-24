/**
 * SystemCraft Collaborative Coding Platform
 * Real-time collaborative coding environment for technical interviews
 * Version: 1.0.0
 */

class CollaborativeCoding {
    constructor() {
        this.editor = null;
        this.currentSession = null;
        this.collaborators = new Map();
        this.problemSets = new ProblemDatabase();
        this.testRunner = new TestRunner();
        this.codeAnalyzer = new CodeAnalyzer();
        this.whiteboard = new Whiteboard();
        this.voiceChat = new VoiceChat();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeEditor();
        this.loadUserPreferences();
        this.setupWebRTC();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Session controls
            document.getElementById('start-coding-session')?.addEventListener('click', () => this.startSession());
            document.getElementById('join-session')?.addEventListener('click', () => this.joinSession());
            document.getElementById('end-session')?.addEventListener('click', () => this.endSession());
            
            // Coding controls
            document.getElementById('run-code')?.addEventListener('click', () => this.runCode());
            document.getElementById('run-tests')?.addEventListener('click', () => this.runTests());
            document.getElementById('submit-solution')?.addEventListener('click', () => this.submitSolution());
            document.getElementById('get-hint')?.addEventListener('click', () => this.getHint());
            
            // Collaboration controls
            document.getElementById('share-screen')?.addEventListener('click', () => this.shareScreen());
            document.getElementById('toggle-voice')?.addEventListener('click', () => this.toggleVoice());
            document.getElementById('toggle-video')?.addEventListener('click', () => this.toggleVideo());
            document.getElementById('switch-role')?.addEventListener('click', () => this.switchRole());
            
            // Problem selection
            document.getElementById('problem-difficulty')?.addEventListener('change', (e) => this.updateProblemFilter(e.target.value));
            document.getElementById('problem-category')?.addEventListener('change', (e) => this.updateCategoryFilter(e.target.value));
            document.getElementById('load-problem')?.addEventListener('click', () => this.loadProblem());
            
            // Editor preferences
            document.getElementById('language-select')?.addEventListener('change', (e) => this.changeLanguage(e.target.value));
            document.getElementById('theme-select')?.addEventListener('change', (e) => this.changeTheme(e.target.value));
            document.getElementById('font-size')?.addEventListener('change', (e) => this.changeFontSize(e.target.value));
        });
    }

    initializeEditor() {
        // Initialize Monaco Editor with collaboration features
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('code-editor'), {
                value: this.getStarterCode('javascript'),
                language: 'javascript',
                theme: 'vs-dark',
                fontSize: 14,
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                readOnly: false
            });

            this.setupEditorCollaboration();
            this.setupEditorEventListeners();
        });
    }

    setupEditorCollaboration() {
        // Real-time collaborative editing
        this.editor.onDidChangeModelContent((e) => {
            if (this.currentSession && !this.isApplyingRemoteChange) {
                const change = {
                    type: 'content-change',
                    changes: e.changes,
                    timestamp: Date.now(),
                    userId: this.currentSession.userId
                };
                
                this.broadcastChange(change);
            }
        });

        // Cursor position tracking
        this.editor.onDidChangeCursorPosition((e) => {
            if (this.currentSession) {
                const cursorInfo = {
                    type: 'cursor-change',
                    position: e.position,
                    userId: this.currentSession.userId,
                    userName: this.currentSession.userName,
                    color: this.currentSession.userColor
                };
                
                this.broadcastChange(cursorInfo);
            }
        });

        // Selection tracking
        this.editor.onDidChangeCursorSelection((e) => {
            if (this.currentSession && !e.selection.isEmpty()) {
                const selectionInfo = {
                    type: 'selection-change',
                    selection: e.selection,
                    userId: this.currentSession.userId,
                    userName: this.currentSession.userName,
                    color: this.currentSession.userColor
                };
                
                this.broadcastChange(selectionInfo);
            }
        });
    }

    setupEditorEventListeners() {
        // Add custom keyboard shortcuts
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            this.runCode();
        });

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
            this.runTests();
        });

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
            this.getHint();
        });

        // Auto-completion and IntelliSense
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: (model, position) => {
                return this.getCustomCompletions(model, position);
            }
        });
    }

    async startSession(sessionType = 'peer') {
        try {
            const sessionConfig = {
                type: sessionType,
                userId: this.generateUserId(),
                userName: this.getUserName(),
                userColor: this.generateUserColor(),
                timestamp: Date.now(),
                problemId: null,
                language: 'javascript',
                role: 'interviewer' // or 'interviewee'
            };

            this.currentSession = new CodingSession(sessionConfig);
            await this.currentSession.initialize();

            this.showSessionInterface();
            this.showNotification('Coding session started!', 'success');

            if (sessionType === 'peer') {
                await this.findCollaborator();
            }

        } catch (error) {
            this.handleError('Failed to start coding session', error);
        }
    }

    async joinSession(sessionId) {
        try {
            if (!sessionId) {
                sessionId = prompt('Enter session ID:');
            }
            
            if (!sessionId) return;

            const sessionConfig = {
                type: 'join',
                sessionId: sessionId,
                userId: this.generateUserId(),
                userName: this.getUserName(),
                userColor: this.generateUserColor(),
                role: 'interviewee'
            };

            this.currentSession = new CodingSession(sessionConfig);
            await this.currentSession.connect();

            this.showSessionInterface();
            this.syncWithSession();
            this.showNotification('Joined coding session!', 'success');

        } catch (error) {
            this.handleError('Failed to join session', error);
        }
    }

    showSessionInterface() {
        document.getElementById('session-setup').style.display = 'none';
        document.getElementById('coding-interface').style.display = 'block';
        
        // Show session info
        const sessionInfo = document.getElementById('session-info');
        sessionInfo.innerHTML = `
            <div class="session-details">
                <span class="session-id">Session: ${this.currentSession.sessionId}</span>
                <span class="user-role">Role: ${this.currentSession.config.role}</span>
                <span class="participants">Participants: ${this.collaborators.size + 1}</span>
            </div>
            <div class="session-controls">
                <button id="share-session" class="btn-secondary">Share Link</button>
                <button id="session-settings" class="btn-secondary">Settings</button>
            </div>
        `;

        // Setup real-time collaboration indicators
        this.setupCollaborationIndicators();
    }

    setupCollaborationIndicators() {
        // Show collaborator cursors and selections
        const decorationsContainer = document.getElementById('collaborator-decorations');
        decorationsContainer.innerHTML = `
            <div class="collaborators-list">
                <h4>Collaborators</h4>
                <div id="active-collaborators"></div>
            </div>
            <div class="collaboration-status">
                <div class="status-indicator" id="connection-status">
                    <span class="status-dot connected"></span>
                    <span class="status-text">Connected</span>
                </div>
            </div>
        `;
    }

    async loadProblem() {
        const difficulty = document.getElementById('problem-difficulty')?.value || 'medium';
        const category = document.getElementById('problem-category')?.value || 'algorithms';
        
        try {
            const problem = await this.problemSets.getProblem({
                difficulty: difficulty,
                category: category,
                language: this.currentSession?.config?.language || 'javascript'
            });

            this.displayProblem(problem);
            this.loadStarterCode(problem);
            
            if (this.currentSession) {
                this.currentSession.currentProblem = problem;
                this.broadcastProblemChange(problem);
            }

        } catch (error) {
            this.handleError('Failed to load problem', error);
        }
    }

    displayProblem(problem) {
        const container = document.getElementById('problem-statement');
        container.innerHTML = `
            <div class="problem-header">
                <h3>${problem.title}</h3>
                <div class="problem-meta">
                    <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span>
                    <span class="category">${problem.category}</span>
                    <span class="acceptance-rate">${problem.acceptanceRate}% acceptance</span>
                </div>
            </div>

            <div class="problem-description">
                <p>${problem.description}</p>
                
                ${problem.examples ? `
                    <div class="examples">
                        <h4>Examples:</h4>
                        ${problem.examples.map((example, index) => `
                            <div class="example">
                                <strong>Example ${index + 1}:</strong>
                                <pre>Input: ${example.input}
Output: ${example.output}</pre>
                                ${example.explanation ? `<p><em>Explanation: ${example.explanation}</em></p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${problem.constraints ? `
                    <div class="constraints">
                        <h4>Constraints:</h4>
                        <ul>
                            ${problem.constraints.map(constraint => `<li>${constraint}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${problem.followUp ? `
                    <div class="follow-up">
                        <h4>Follow-up:</h4>
                        <p>${problem.followUp}</p>
                    </div>
                ` : ''}
            </div>

            <div class="problem-actions">
                <button id="start-timer" class="btn-primary">Start Timer</button>
                <button id="toggle-hints" class="btn-secondary">Toggle Hints</button>
                <button id="view-solution" class="btn-secondary">View Solution</button>
            </div>
        `;

        // Setup problem-specific event listeners
        document.getElementById('start-timer')?.addEventListener('click', () => this.startProblemTimer());
        document.getElementById('toggle-hints')?.addEventListener('click', () => this.toggleHints());
        document.getElementById('view-solution')?.addEventListener('click', () => this.viewSolution());
    }

    loadStarterCode(problem) {
        const starterCode = this.getStarterCode(this.currentSession?.config?.language || 'javascript', problem);
        this.editor.setValue(starterCode);
        
        // Add function signature suggestions
        this.addFunctionSignatures(problem);
    }

    getStarterCode(language, problem = null) {
        const templates = {
            javascript: {
                default: `// Your solution here
function solution() {
    
}

// Test your solution
console.log(solution());`,
                twoPointers: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
    
};`,
                binaryTree: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var solution = function(root) {
    // Your solution here
    
};`
            },
            python: {
                default: `# Your solution here
def solution():
    pass

# Test your solution
print(solution())`,
                twoPointers: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`,
                binaryTree: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def solution(self, root: TreeNode) -> int:
        # Your solution here
        pass`
            },
            java: {
                default: `public class Solution {
    public int solution() {
        // Your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution());
    }
}`,
                twoPointers: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`,
                binaryTree: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public int solution(TreeNode root) {
        // Your solution here
        return 0;
    }
}`
            }
        };

        const languageTemplates = templates[language] || templates.javascript;
        
        if (problem && problem.pattern && languageTemplates[problem.pattern]) {
            return languageTemplates[problem.pattern];
        }
        
        return languageTemplates.default;
    }

    async runCode() {
        const code = this.editor.getValue();
        const language = this.currentSession?.config?.language || 'javascript';

        try {
            this.showExecutionStatus('Running code...');
            
            const result = await this.testRunner.execute(code, language);
            this.displayExecutionResult(result);
            
            // Broadcast execution to collaborators
            if (this.currentSession) {
                this.broadcastExecution(code, result);
            }

        } catch (error) {
            this.displayExecutionError(error);
        }
    }

    async runTests() {
        const code = this.editor.getValue();
        const problem = this.currentSession?.currentProblem;
        
        if (!problem) {
            this.showError('No problem loaded to test against');
            return;
        }

        try {
            this.showExecutionStatus('Running tests...');
            
            const testResults = await this.testRunner.runTests(code, problem.testCases, problem.language);
            this.displayTestResults(testResults);
            
            // Update progress tracking
            this.updateProgress(testResults);

        } catch (error) {
            this.displayExecutionError(error);
        }
    }

    displayExecutionResult(result) {
        const container = document.getElementById('execution-output');
        container.innerHTML = `
            <div class="execution-result">
                <div class="result-header">
                    <h4>Execution Result</h4>
                    <span class="execution-time">${result.executionTime}ms</span>
                </div>
                
                ${result.output ? `
                    <div class="output-section">
                        <h5>Output:</h5>
                        <pre class="output-content">${result.output}</pre>
                    </div>
                ` : ''}
                
                ${result.error ? `
                    <div class="error-section">
                        <h5>Error:</h5>
                        <pre class="error-content">${result.error}</pre>
                    </div>
                ` : ''}
                
                ${result.memory ? `
                    <div class="memory-usage">
                        <span>Memory Used: ${result.memory}MB</span>
                    </div>
                ` : ''}
            </div>
        `;

        container.scrollIntoView({ behavior: 'smooth' });
    }

    displayTestResults(testResults) {
        const container = document.getElementById('test-results');
        container.innerHTML = `
            <div class="test-results-summary">
                <h4>Test Results</h4>
                <div class="summary-stats">
                    <span class="passed-tests">${testResults.passed}/${testResults.total} Passed</span>
                    <span class="execution-time">Total Time: ${testResults.totalTime}ms</span>
                    <span class="memory-usage">Memory: ${testResults.memoryUsed}MB</span>
                </div>
            </div>

            <div class="test-cases">
                ${testResults.cases.map((testCase, index) => `
                    <div class="test-case ${testCase.passed ? 'passed' : 'failed'}">
                        <div class="test-header">
                            <span class="test-number">Test Case ${index + 1}</span>
                            <span class="test-status">${testCase.passed ? '✅' : '❌'}</span>
                            <span class="test-time">${testCase.executionTime}ms</span>
                        </div>
                        
                        <div class="test-details">
                            <div class="test-input">
                                <strong>Input:</strong>
                                <pre>${JSON.stringify(testCase.input, null, 2)}</pre>
                            </div>
                            
                            <div class="test-output">
                                <strong>Expected:</strong>
                                <pre class="expected-output">${JSON.stringify(testCase.expected, null, 2)}</pre>
                                
                                <strong>Got:</strong>
                                <pre class="actual-output">${JSON.stringify(testCase.actual, null, 2)}</pre>
                            </div>
                            
                            ${testCase.error ? `
                                <div class="test-error">
                                    <strong>Error:</strong>
                                    <pre>${testCase.error}</pre>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            ${testResults.allPassed ? `
                <div class="success-message">
                    <h3>🎉 All tests passed!</h3>
                    <div class="next-actions">
                        <button id="optimize-solution" class="btn-primary">Optimize Solution</button>
                        <button id="next-problem" class="btn-secondary">Next Problem</button>
                        <button id="review-solution" class="btn-secondary">Review Solution</button>
                    </div>
                </div>
            ` : ''}
        `;

        // Setup next action handlers
        document.getElementById('optimize-solution')?.addEventListener('click', () => this.startOptimization());
        document.getElementById('next-problem')?.addEventListener('click', () => this.loadNextProblem());
        document.getElementById('review-solution')?.addEventListener('click', () => this.reviewSolution());
    }

    async getHint() {
        const problem = this.currentSession?.currentProblem;
        const currentCode = this.editor.getValue();

        if (!problem) {
            this.showError('No problem loaded for hints');
            return;
        }

        try {
            const hint = await this.codeAnalyzer.generateHint(problem, currentCode);
            this.displayHint(hint);
            
            // Track hint usage for analytics
            this.trackHintUsage(hint.level);

        } catch (error) {
            this.handleError('Failed to generate hint', error);
        }
    }

    displayHint(hint) {
        const hintModal = document.createElement('div');
        hintModal.className = 'hint-modal';
        hintModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💡 Hint ${hint.level}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="hint-content">
                        <p>${hint.content}</p>
                        
                        ${hint.codeExample ? `
                            <div class="hint-code">
                                <h4>Example:</h4>
                                <pre><code>${hint.codeExample}</code></pre>
                            </div>
                        ` : ''}
                        
                        ${hint.concept ? `
                            <div class="hint-concept">
                                <h4>Key Concept:</h4>
                                <p>${hint.concept}</p>
                            </div>
                        ` : ''}
                        
                        ${hint.timeComplexity ? `
                            <div class="hint-complexity">
                                <p><strong>Target Time Complexity:</strong> ${hint.timeComplexity}</p>
                                <p><strong>Target Space Complexity:</strong> ${hint.spaceComplexity}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="more-hints" class="btn-secondary">More Hints</button>
                    <button id="close-hint" class="btn-primary">Got it!</button>
                </div>
            </div>
        `;

        document.body.appendChild(hintModal);

        // Modal event listeners
        hintModal.querySelector('.close-modal').addEventListener('click', () => {
            hintModal.remove();
        });

        hintModal.querySelector('#close-hint').addEventListener('click', () => {
            hintModal.remove();
        });

        hintModal.querySelector('#more-hints')?.addEventListener('click', () => {
            hintModal.remove();
            this.getHint(); // Get next level hint
        });
    }

    async submitSolution() {
        const code = this.editor.getValue();
        const problem = this.currentSession?.currentProblem;

        if (!problem) {
            this.showError('No problem loaded to submit');
            return;
        }

        try {
            // Run all test cases first
            const testResults = await this.testRunner.runTests(code, problem.testCases, problem.language);
            
            if (!testResults.allPassed) {
                this.showError('Please fix failing test cases before submitting');
                return;
            }

            // Analyze solution quality
            const analysis = await this.codeAnalyzer.analyzeSolution(code, problem);
            
            // Submit solution
            const submission = await this.submitToSystem(code, problem, analysis);
            this.displaySubmissionResult(submission);

        } catch (error) {
            this.handleError('Submission failed', error);
        }
    }

    displaySubmissionResult(submission) {
        const resultModal = document.createElement('div');
        resultModal.className = 'submission-modal';
        resultModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎯 Submission Result</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="submission-summary">
                        <div class="submission-status ${submission.accepted ? 'accepted' : 'rejected'}">
                            ${submission.accepted ? '✅ Accepted' : '❌ Rejected'}
                        </div>
                        
                        <div class="submission-metrics">
                            <div class="metric">
                                <span class="label">Runtime:</span>
                                <span class="value">${submission.runtime}ms</span>
                                <span class="percentile">Beats ${submission.runtimePercentile}%</span>
                            </div>
                            <div class="metric">
                                <span class="label">Memory:</span>
                                <span class="value">${submission.memory}MB</span>
                                <span class="percentile">Beats ${submission.memoryPercentile}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="code-analysis">
                        <h4>Code Analysis</h4>
                        <div class="analysis-metrics">
                            <div class="complexity">
                                <p><strong>Time Complexity:</strong> ${submission.analysis.timeComplexity}</p>
                                <p><strong>Space Complexity:</strong> ${submission.analysis.spaceComplexity}</p>
                            </div>
                            <div class="code-quality">
                                <p><strong>Code Quality Score:</strong> ${submission.analysis.qualityScore}/100</p>
                                <p><strong>Readability:</strong> ${submission.analysis.readability}/10</p>
                            </div>
                        </div>
                    </div>

                    ${submission.feedback ? `
                        <div class="feedback-section">
                            <h4>Feedback</h4>
                            <div class="strengths">
                                <h5>Strengths:</h5>
                                <ul>
                                    ${submission.feedback.strengths.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="improvements">
                                <h5>Areas for Improvement:</h5>
                                <ul>
                                    ${submission.feedback.improvements.map(i => `<li>${i}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button id="view-optimal" class="btn-secondary">View Optimal Solution</button>
                    <button id="next-problem-submit" class="btn-primary">Next Problem</button>
                </div>
            </div>
        `;

        document.body.appendChild(resultModal);

        // Modal event listeners
        resultModal.querySelector('.close-modal').addEventListener('click', () => {
            resultModal.remove();
        });

        resultModal.querySelector('#view-optimal')?.addEventListener('click', () => {
            this.viewOptimalSolution();
            resultModal.remove();
        });

        resultModal.querySelector('#next-problem-submit')?.addEventListener('click', () => {
            this.loadNextProblem();
            resultModal.remove();
        });
    }

    // Real-time collaboration methods
    broadcastChange(change) {
        if (this.currentSession && this.currentSession.connection) {
            this.currentSession.connection.send(JSON.stringify(change));
        }
    }

    applyRemoteChange(change) {
        this.isApplyingRemoteChange = true;

        switch (change.type) {
            case 'content-change':
                this.applyContentChange(change);
                break;
            case 'cursor-change':
                this.showRemoteCursor(change);
                break;
            case 'selection-change':
                this.showRemoteSelection(change);
                break;
            case 'problem-change':
                this.syncProblem(change.problem);
                break;
        }

        this.isApplyingRemoteChange = false;
    }

    applyContentChange(change) {
        const model = this.editor.getModel();
        change.changes.forEach(chg => {
            const range = new monaco.Range(
                chg.range.startLineNumber,
                chg.range.startColumn,
                chg.range.endLineNumber,
                chg.range.endColumn
            );
            
            model.applyEdits([{
                range: range,
                text: chg.text
            }]);
        });
    }

    showRemoteCursor(cursorInfo) {
        // Display collaborator's cursor position
        const decoration = {
            range: new monaco.Range(
                cursorInfo.position.lineNumber,
                cursorInfo.position.column,
                cursorInfo.position.lineNumber,
                cursorInfo.position.column
            ),
            options: {
                className: `remote-cursor cursor-${cursorInfo.userId}`,
                hoverMessage: { value: `${cursorInfo.userName}'s cursor` },
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
        };

        this.editor.deltaDecorations([], [decoration]);
        
        // Update collaborator info
        this.updateCollaboratorInfo(cursorInfo);
    }

    updateCollaboratorInfo(collaboratorInfo) {
        this.collaborators.set(collaboratorInfo.userId, collaboratorInfo);
        
        const container = document.getElementById('active-collaborators');
        container.innerHTML = Array.from(this.collaborators.values()).map(collab => `
            <div class="collaborator" style="border-left: 3px solid ${collab.color}">
                <span class="collaborator-name">${collab.userName}</span>
                <span class="collaborator-status">Active</span>
            </div>
        `).join('');
    }

    // Voice and video chat integration
    async toggleVoice() {
        if (!this.voiceChat.isActive) {
            await this.voiceChat.startCall();
            document.getElementById('toggle-voice').textContent = 'Mute';
        } else {
            await this.voiceChat.endCall();
            document.getElementById('toggle-voice').textContent = 'Unmute';
        }
    }

    async shareScreen() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            // Share screen with collaborators
            if (this.currentSession && this.currentSession.connection) {
                // Implement screen sharing logic
                this.showNotification('Screen sharing started', 'success');
            }
            
        } catch (error) {
            this.handleError('Screen sharing failed', error);
        }
    }

    switchRole() {
        if (this.currentSession) {
            const currentRole = this.currentSession.config.role;
            const newRole = currentRole === 'interviewer' ? 'interviewee' : 'interviewer';
            
            this.currentSession.config.role = newRole;
            this.broadcastRoleChange(newRole);
            
            // Update UI based on role
            this.updateRoleUI(newRole);
            this.showNotification(`Switched to ${newRole} role`, 'info');
        }
    }

    updateRoleUI(role) {
        const roleIndicator = document.getElementById('user-role');
        if (roleIndicator) {
            roleIndicator.textContent = `Role: ${role}`;
        }

        // Show/hide role-specific controls
        const interviewerControls = document.querySelectorAll('.interviewer-only');
        const intervieweeControls = document.querySelectorAll('.interviewee-only');

        if (role === 'interviewer') {
            interviewerControls.forEach(el => el.style.display = 'block');
            intervieweeControls.forEach(el => el.style.display = 'none');
        } else {
            interviewerControls.forEach(el => el.style.display = 'none');
            intervieweeControls.forEach(el => el.style.display = 'block');
        }
    }

    // Utility methods
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    generateUserColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getUserName() {
        return localStorage.getItem('systemcraft_username') || 'Anonymous';
    }

    loadUserPreferences() {
        const prefs = localStorage.getItem('systemcraft_coding_prefs');
        if (prefs) {
            this.preferences = JSON.parse(prefs);
        } else {
            this.preferences = {
                theme: 'vs-dark',
                fontSize: 14,
                language: 'javascript',
                autoSave: true,
                enableCollaboration: true
            };
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    handleError(message, error) {
        console.error(message, error);
        this.showError(`${message}. Please try again.`);
    }
}

// Problem Database Component
class ProblemDatabase {
    constructor() {
        this.problems = this.initializeProblems();
        this.categories = ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'sorting', 'searching'];
        this.difficulties = ['easy', 'medium', 'hard'];
    }

    initializeProblems() {
        return [
            {
                id: 'two-sum',
                title: 'Two Sum',
                difficulty: 'easy',
                category: 'arrays',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                examples: [
                    {
                        input: 'nums = [2,7,11,15], target = 9',
                        output: '[0,1]',
                        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                    }
                ],
                constraints: [
                    '2 <= nums.length <= 10^4',
                    '-10^9 <= nums[i] <= 10^9',
                    '-10^9 <= target <= 10^9',
                    'Only one valid answer exists.'
                ],
                testCases: [
                    { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
                    { input: [[3, 2, 4], 6], expected: [1, 2] },
                    { input: [[3, 3], 6], expected: [0, 1] }
                ],
                hints: [
                    'Think about what you need to find for each number.',
                    'A hash table can help you find the complement efficiently.',
                    'You can solve this in one pass through the array.'
                ],
                acceptanceRate: 49.1,
                pattern: 'twoPointers'
            },
            {
                id: 'reverse-linked-list',
                title: 'Reverse Linked List',
                difficulty: 'easy',
                category: 'linked-lists',
                description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
                examples: [
                    {
                        input: 'head = [1,2,3,4,5]',
                        output: '[5,4,3,2,1]'
                    }
                ],
                constraints: [
                    'The number of nodes in the list is the range [0, 5000].',
                    '-5000 <= Node.val <= 5000'
                ],
                testCases: [
                    { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
                    { input: [[1, 2]], expected: [2, 1] },
                    { input: [[]], expected: [] }
                ],
                followUp: 'A linked list can be reversed either iteratively or recursively. Could you implement both?',
                acceptanceRate: 68.6
            },
            {
                id: 'binary-tree-inorder',
                title: 'Binary Tree Inorder Traversal',
                difficulty: 'medium',
                category: 'trees',
                description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
                examples: [
                    {
                        input: 'root = [1,null,2,3]',
                        output: '[1,3,2]'
                    }
                ],
                constraints: [
                    'The number of nodes in the tree is in the range [0, 100].',
                    '-100 <= Node.val <= 100'
                ],
                testCases: [
                    { input: [[1, null, 2, 3]], expected: [1, 3, 2] },
                    { input: [[]], expected: [] },
                    { input: [[1]], expected: [1] }
                ],
                followUp: 'Recursive solution is trivial, could you do it iteratively?',
                acceptanceRate: 67.4,
                pattern: 'binaryTree'
            }
        ];
    }

    async getProblem(criteria) {
        const filtered = this.problems.filter(problem => {
            return (!criteria.difficulty || problem.difficulty === criteria.difficulty) &&
                   (!criteria.category || problem.category === criteria.category);
        });

        if (filtered.length === 0) {
            throw new Error('No problems found matching criteria');
        }

        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    getRandomProblem() {
        return this.problems[Math.floor(Math.random() * this.problems.length)];
    }

    getProblemsByDifficulty(difficulty) {
        return this.problems.filter(p => p.difficulty === difficulty);
    }
}

// Test Runner Component
class TestRunner {
    async execute(code, language) {
        // Simulate code execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        return {
            output: this.generateOutput(code),
            executionTime: Math.floor(Math.random() * 100) + 50,
            memory: Math.floor(Math.random() * 50) + 10,
            error: Math.random() > 0.8 ? 'SyntaxError: Unexpected token' : null
        };
    }

    async runTests(code, testCases, language) {
        const results = {
            cases: [],
            passed: 0,
            total: testCases.length,
            allPassed: false,
            totalTime: 0,
            memoryUsed: 0
        };

        for (const testCase of testCases) {
            const result = await this.runSingleTest(code, testCase, language);
            results.cases.push(result);
            
            if (result.passed) results.passed++;
            results.totalTime += result.executionTime;
            results.memoryUsed = Math.max(results.memoryUsed, result.memoryUsed);
        }

        results.allPassed = results.passed === results.total;
        return results;
    }

    async runSingleTest(code, testCase, language) {
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
        
        const passed = Math.random() > 0.3; // 70% pass rate simulation
        
        return {
            input: testCase.input,
            expected: testCase.expected,
            actual: passed ? testCase.expected : 'Wrong answer',
            passed: passed,
            executionTime: Math.floor(Math.random() * 50) + 10,
            memoryUsed: Math.floor(Math.random() * 20) + 5,
            error: !passed && Math.random() > 0.5 ? 'Runtime Error' : null
        };
    }

    generateOutput(code) {
        // Basic output simulation
        if (code.includes('console.log')) {
            return 'Hello World!';
        } else if (code.includes('return')) {
            return '42';
        }
        return '';
    }
}

// Code Analyzer Component
class CodeAnalyzer {
    async generateHint(problem, currentCode) {
        const analysis = this.analyzeCurrentCode(currentCode);
        const hintLevel = this.getHintLevel(analysis);
        
        return {
            level: hintLevel,
            content: this.getHintContent(problem, hintLevel),
            codeExample: this.getHintExample(problem, hintLevel),
            concept: this.getKeyConcept(problem, hintLevel),
            timeComplexity: problem.optimalComplexity?.time || 'O(n)',
            spaceComplexity: problem.optimalComplexity?.space || 'O(1)'
        };
    }

    analyzeCurrentCode(code) {
        return {
            hasLoops: code.includes('for') || code.includes('while'),
            hasRecursion: /function.*\w+.*\(\).*{[\s\S]*\w+\(\)/.test(code),
            hasDataStructures: code.includes('Map') || code.includes('Set') || code.includes('Array'),
            complexity: this.estimateComplexity(code),
            completeness: this.estimateCompleteness(code)
        };
    }

    getHintContent(problem, level) {
        const hints = {
            1: "Think about the brute force approach first. What's the most straightforward way to solve this?",
            2: "Consider what data structures might help you store and retrieve information efficiently.",
            3: "Look for patterns in the problem. Can you optimize by avoiding redundant work?",
            4: "Think about the time and space complexity. Is there a trade-off you can make?",
            5: "Consider the mathematical properties or algorithmic techniques that apply here."
        };
        
        return hints[level] || hints[1];
    }

    async analyzeSolution(code, problem) {
        return {
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            qualityScore: Math.floor(Math.random() * 40) + 60,
            readability: Math.floor(Math.random() * 4) + 6,
            optimizations: this.suggestOptimizations(code),
            codeSmells: this.detectCodeSmells(code)
        };
    }

    estimateComplexity(code) {
        let complexity = 'O(1)';
        
        if (code.includes('for') || code.includes('while')) {
            const nestedLoops = (code.match(/for|while/g) || []).length;
            complexity = nestedLoops > 1 ? 'O(n²)' : 'O(n)';
        }
        
        return complexity;
    }

    estimateCompleteness(code) {
        const indicators = [
            code.includes('function'),
            code.includes('return'),
            code.length > 50,
            code.includes('{') && code.includes('}'),
            !code.includes('// Your solution here')
        ];
        
        return indicators.filter(Boolean).length / indicators.length;
    }
}

// Coding Session Management
class CodingSession {
    constructor(config) {
        this.config = config;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.currentProblem = null;
        this.connection = null;
        this.isActive = false;
    }

    async initialize() {
        // Initialize WebRTC connection for collaboration
        this.isActive = true;
        return this.setupConnection();
    }

    async connect() {
        // Connect to existing session
        this.isActive = true;
        return this.joinExistingSession();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    async setupConnection() {
        // WebRTC setup would go here
        return Promise.resolve();
    }

    async joinExistingSession() {
        // Join existing session logic
        return Promise.resolve();
    }
}

// WebRTC Voice Chat Component
class VoiceChat {
    constructor() {
        this.isActive = false;
        this.localStream = null;
        this.remoteStream = null;
    }

    async startCall() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.isActive = true;
        } catch (error) {
            console.error('Failed to start voice chat:', error);
        }
    }

    async endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        this.isActive = false;
    }
}

// Whiteboard Component for System Design
class Whiteboard {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.isDrawing = false;
        this.shapes = [];
    }

    initialize(canvasElement) {
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.context.beginPath();
        this.context.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.context.lineTo(x, y);
        this.context.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.context.beginPath();
    }
}

// Initialize collaborative coding system
document.addEventListener('DOMContentLoaded', () => {
    window.collaborativeCoding = new CollaborativeCoding();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollaborativeCoding;
}