/**
 * Interactive System Design Canvas
 * Drag-and-drop system architecture builder with real-time validation
 */

class InteractiveDesignCanvas {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.stage = null;
        this.layer = null;
        this.components = new Map();
        this.connections = new Map();
        this.selectedComponent = null;
        this.draggedComponent = null;
        this.isConnecting = false;
        this.tempConnection = null;
        
        this.options = {
            gridSize: 20,
            snapToGrid: true,
            showMetrics: true,
            realTimeValidation: true,
            ...options
        };

        this.componentLibrary = this.initializeComponentLibrary();
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createComponentLibrary();
        this.setupToolbar();
    }

    setupCanvas() {
        const stage = new Konva.Stage({
            container: this.canvas,
            width: this.canvas.offsetWidth,
            height: 600,
            draggable: false
        });

        this.stage = stage;
        this.layer = new Konva.Layer();
        stage.add(this.layer);

        // Add grid background
        if (this.options.showGrid) {
            this.drawGrid();
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.stage.width(this.canvas.offsetWidth);
            this.stage.batchDraw();
        });
    }

    drawGrid() {
        const gridLayer = new Konva.Layer();
        const stage = this.stage;
        const gridSize = this.options.gridSize;

        for (let i = 0; i < stage.width() / gridSize; i++) {
            gridLayer.add(new Konva.Line({
                points: [Math.round(i * gridSize) + 0.5, 0, Math.round(i * gridSize) + 0.5, stage.height()],
                stroke: '#ddd',
                strokeWidth: 1,
                opacity: 0.3
            }));
        }

        for (let j = 0; j < stage.height() / gridSize; j++) {
            gridLayer.add(new Konva.Line({
                points: [0, Math.round(j * gridSize) + 0.5, stage.width(), Math.round(j * gridSize) + 0.5],
                stroke: '#ddd',
                strokeWidth: 1,
                opacity: 0.3
            }));
        }

        this.stage.add(gridLayer);
        gridLayer.moveToBottom();
    }

    initializeComponentLibrary() {
        return {
            'load_balancer': {
                name: 'Load Balancer',
                icon: '⚖️',
                color: '#4CAF50',
                width: 120,
                height: 80,
                inputs: ['HTTP Requests'],
                outputs: ['Distributed Requests'],
                properties: {
                    algorithm: 'Round Robin',
                    health_checks: true,
                    ssl_termination: true
                },
                constraints: {
                    max_throughput: '100K RPS',
                    latency: '< 5ms'
                },
                cost: 50 // USD per month
            },
            'web_server': {
                name: 'Web Server',
                icon: '🌐',
                color: '#2196F3',
                width: 120,
                height: 80,
                inputs: ['HTTP Requests'],
                outputs: ['API Calls', 'Static Content'],
                properties: {
                    server_type: 'NGINX',
                    caching: true,
                    compression: true
                },
                constraints: {
                    concurrent_connections: '10K',
                    memory_usage: '2GB'
                },
                cost: 100
            },
            'database': {
                name: 'Database',
                icon: '🗄️',
                color: '#FF9800',
                width: 120,
                height: 100,
                inputs: ['Queries', 'Writes'],
                outputs: ['Data', 'Query Results'],
                properties: {
                    type: 'PostgreSQL',
                    replication: 'Master-Slave',
                    sharding: false
                },
                constraints: {
                    storage_capacity: '1TB',
                    query_latency: '< 100ms'
                },
                cost: 200
            },
            'cache': {
                name: 'Cache',
                icon: '⚡',
                color: '#E91E63',
                width: 100,
                height: 70,
                inputs: ['Cache Requests'],
                outputs: ['Cached Data'],
                properties: {
                    type: 'Redis',
                    eviction_policy: 'LRU',
                    persistence: true
                },
                constraints: {
                    memory_size: '16GB',
                    hit_ratio: '> 95%'
                },
                cost: 75
            },
            'message_queue': {
                name: 'Message Queue',
                icon: '📨',
                color: '#9C27B0',
                width: 110,
                height: 75,
                inputs: ['Messages'],
                outputs: ['Processed Messages'],
                properties: {
                    type: 'SQS',
                    ordering: 'FIFO',
                    durability: true
                },
                constraints: {
                    throughput: '1M msgs/sec',
                    retention: '14 days'
                },
                cost: 30
            },
            'cdn': {
                name: 'CDN',
                icon: '🌍',
                color: '#607D8B',
                width: 100,
                height: 70,
                inputs: ['Static Requests'],
                outputs: ['Cached Content'],
                properties: {
                    provider: 'CloudFront',
                    edge_locations: 200,
                    ssl: true
                },
                constraints: {
                    cache_hit_ratio: '> 90%',
                    global_latency: '< 50ms'
                },
                cost: 40
            }
        };
    }

    createComponentLibrary() {
        const libraryContainer = document.getElementById('component-library');
        if (!libraryContainer) return;

        const libraryHTML = Object.entries(this.componentLibrary).map(([id, component]) => `
            <div class="component-item" draggable="true" data-component-type="${id}">
                <span class="component-icon">${component.icon}</span>
                <span class="component-name">${component.name}</span>
            </div>
        `).join('');

        libraryContainer.innerHTML = `
            <div class="library-title">Component Library</div>
            <div class="component-grid">
                ${libraryHTML}
            </div>
        `;

        // Add drag and drop functionality
        libraryContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('component-item')) {
                e.dataTransfer.setData('component-type', e.target.dataset.componentType);
            }
        });
    }

    setupEventListeners() {
        // Canvas drop handling
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const componentType = e.dataTransfer.getData('component-type');
            if (componentType) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addComponent(componentType, x, y);
            }
        });

        // Stage click handling
        this.stage.on('click', (e) => {
            if (e.target === this.stage) {
                this.deselectAll();
            }
        });

        // Component selection and connection
        this.stage.on('click', (e) => {
            const target = e.target;
            if (target.getClassName() === 'Group') {
                this.selectComponent(target);
                
                if (this.isConnecting && this.selectedComponent && this.selectedComponent !== target) {
                    this.createConnection(this.selectedComponent, target);
                    this.isConnecting = false;
                    this.updateConnectionMode(false);
                }
            }
        });
    }

    setupToolbar() {
        const toolbar = document.getElementById('canvas-toolbar');
        if (!toolbar) return;

        toolbar.innerHTML = `
            <div class="tool-group">
                <button class="tool-button" id="select-tool" data-tool="select">
                    <i class="fas fa-mouse-pointer"></i> Select
                </button>
                <button class="tool-button" id="connect-tool" data-tool="connect">
                    <i class="fas fa-link"></i> Connect
                </button>
            </div>
            
            <div class="tool-separator"></div>
            
            <div class="tool-group">
                <button class="tool-button" id="validate-design">
                    <i class="fas fa-check-circle"></i> Validate
                </button>
                <button class="tool-button" id="export-design">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
            
            <div class="tool-separator"></div>
            
            <div class="tool-group">
                <button class="tool-button" id="clear-canvas">
                    <i class="fas fa-trash"></i> Clear
                </button>
            </div>
        `;

        // Tool event listeners
        toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.tool-button');
            if (!button) return;

            const tool = button.dataset.tool;
            const id = button.id;

            switch (id) {
                case 'select-tool':
                    this.setTool('select');
                    break;
                case 'connect-tool':
                    this.setTool('connect');
                    break;
                case 'validate-design':
                    this.validateDesign();
                    break;
                case 'export-design':
                    this.exportDesign();
                    break;
                case 'clear-canvas':
                    this.clearCanvas();
                    break;
            }
        });
    }

    addComponent(componentType, x, y) {
        const template = this.componentLibrary[componentType];
        if (!template) return;

        const componentId = `${componentType}_${Date.now()}`;
        
        // Snap to grid if enabled
        if (this.options.snapToGrid) {
            x = Math.round(x / this.options.gridSize) * this.options.gridSize;
            y = Math.round(y / this.options.gridSize) * this.options.gridSize;
        }

        const group = new Konva.Group({
            id: componentId,
            x: x,
            y: y,
            draggable: true
        });

        // Component background
        const rect = new Konva.Rect({
            width: template.width,
            height: template.height,
            fill: template.color,
            stroke: '#333',
            strokeWidth: 2,
            cornerRadius: 8
        });

        // Component icon
        const icon = new Konva.Text({
            x: 10,
            y: 10,
            text: template.icon,
            fontSize: 24,
            fontFamily: 'Arial'
        });

        // Component name
        const name = new Konva.Text({
            x: 45,
            y: 15,
            text: template.name,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: 'white',
            fontStyle: 'bold'
        });

        // Add connection points
        const connectionPoints = this.createConnectionPoints(template);

        group.add(rect, icon, name, ...connectionPoints);
        
        // Store component data
        this.components.set(componentId, {
            group: group,
            template: template,
            type: componentType,
            connections: []
        });

        // Add drag constraints
        group.on('dragmove', () => {
            if (this.options.snapToGrid) {
                group.x(Math.round(group.x() / this.options.gridSize) * this.options.gridSize);
                group.y(Math.round(group.y() / this.options.gridSize) * this.options.gridSize);
            }
            this.updateConnections(componentId);
        });

        group.on('click', (e) => {
            e.cancelBubble = true;
            this.selectComponent(group);
        });

        this.layer.add(group);
        this.layer.batchDraw();

        if (this.options.realTimeValidation) {
            this.validateDesign();
        }

        this.updateMetrics();
    }

    createConnectionPoints(template) {
        const points = [];
        const width = template.width;
        const height = template.height;

        // Input points (left side)
        if (template.inputs.length > 0) {
            const inputY = height / 2;
            const inputPoint = new Konva.Circle({
                x: 0,
                y: inputY,
                radius: 6,
                fill: '#4CAF50',
                stroke: '#fff',
                strokeWidth: 2,
                name: 'connection-point input'
            });
            points.push(inputPoint);
        }

        // Output points (right side)
        if (template.outputs.length > 0) {
            const outputY = height / 2;
            const outputPoint = new Konva.Circle({
                x: width,
                y: outputY,
                radius: 6,
                fill: '#F44336',
                stroke: '#fff',
                strokeWidth: 2,
                name: 'connection-point output'
            });
            points.push(outputPoint);
        }

        return points;
    }

    selectComponent(group) {
        this.deselectAll();
        this.selectedComponent = group;
        
        // Highlight selected component
        const rect = group.children[0];
        rect.stroke('#FFD700');
        rect.strokeWidth(3);
        
        this.layer.batchDraw();
        this.showComponentProperties(group.id());
    }

    deselectAll() {
        if (this.selectedComponent) {
            const rect = this.selectedComponent.children[0];
            rect.stroke('#333');
            rect.strokeWidth(2);
        }
        this.selectedComponent = null;
        this.layer.batchDraw();
        this.hideComponentProperties();
    }

    createConnection(source, target) {
        const connectionId = `conn_${Date.now()}`;
        
        // Get connection points
        const sourceRect = source.getClientRect();
        const targetRect = target.getClientRect();
        
        const line = new Konva.Line({
            points: [
                sourceRect.x + sourceRect.width,
                sourceRect.y + sourceRect.height / 2,
                targetRect.x,
                targetRect.y + targetRect.height / 2
            ],
            stroke: '#4F46E5',
            strokeWidth: 3,
            lineCap: 'round',
            lineJoin: 'round'
        });

        // Add arrow head
        const arrow = new Konva.RegularPolygon({
            x: targetRect.x,
            y: targetRect.y + targetRect.height / 2,
            sides: 3,
            radius: 8,
            fill: '#4F46E5',
            rotation: 90
        });

        const connectionGroup = new Konva.Group({
            id: connectionId
        });

        connectionGroup.add(line, arrow);

        // Store connection data
        this.connections.set(connectionId, {
            group: connectionGroup,
            source: source.id(),
            target: target.id(),
            line: line,
            arrow: arrow
        });

        // Update component connections
        this.components.get(source.id()).connections.push(connectionId);
        this.components.get(target.id()).connections.push(connectionId);

        this.layer.add(connectionGroup);
        connectionGroup.moveToBottom();
        this.layer.batchDraw();

        if (this.options.realTimeValidation) {
            this.validateDesign();
        }

        this.updateMetrics();
    }

    updateConnections(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        component.connections.forEach(connectionId => {
            const connection = this.connections.get(connectionId);
            if (!connection) return;

            const sourceComponent = this.components.get(connection.source);
            const targetComponent = this.components.get(connection.target);

            if (!sourceComponent || !targetComponent) return;

            const sourceRect = sourceComponent.group.getClientRect();
            const targetRect = targetComponent.group.getClientRect();

            // Update line points
            connection.line.points([
                sourceRect.x + sourceRect.width,
                sourceRect.y + sourceRect.height / 2,
                targetRect.x,
                targetRect.y + targetRect.height / 2
            ]);

            // Update arrow position
            connection.arrow.position({
                x: targetRect.x,
                y: targetRect.y + targetRect.height / 2
            });
        });

        this.layer.batchDraw();
    }

    setTool(tool) {
        // Reset all tool buttons
        document.querySelectorAll('.tool-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activate selected tool
        document.getElementById(`${tool}-tool`).classList.add('active');

        if (tool === 'connect') {
            this.isConnecting = true;
            this.updateConnectionMode(true);
        } else {
            this.isConnecting = false;
            this.updateConnectionMode(false);
        }
    }

    updateConnectionMode(connecting) {
        if (connecting) {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    validateDesign() {
        const validation = this.performValidation();
        this.displayValidationResults(validation);
        return validation;
    }

    performValidation() {
        const issues = [];
        const warnings = [];
        const suggestions = [];

        // Check for isolated components
        this.components.forEach((component, id) => {
            if (component.connections.length === 0) {
                warnings.push(`${component.template.name} is not connected to any other components`);
            }
        });

        // Check for single points of failure
        const criticalComponents = this.findCriticalComponents();
        criticalComponents.forEach(component => {
            warnings.push(`${component.name} is a potential single point of failure`);
        });

        // Check for missing load balancer in high-traffic scenarios
        if (this.components.size > 3 && !this.hasComponentType('load_balancer')) {
            suggestions.push('Consider adding a load balancer for better traffic distribution');
        }

        // Check for missing caching layer
        if (this.hasComponentType('database') && !this.hasComponentType('cache')) {
            suggestions.push('Consider adding a caching layer to reduce database load');
        }

        // Calculate estimated metrics
        const metrics = this.calculateSystemMetrics();

        return {
            isValid: issues.length === 0,
            issues,
            warnings,
            suggestions,
            metrics,
            score: this.calculateDesignScore(issues, warnings, suggestions)
        };
    }

    calculateSystemMetrics() {
        let totalCost = 0;
        let estimatedLatency = 0;
        let throughputBottleneck = Number.MAX_SAFE_INTEGER;

        this.components.forEach(component => {
            totalCost += component.template.cost || 0;
            
            // Estimate latency contribution
            if (component.template.constraints.latency) {
                const latency = parseFloat(component.template.constraints.latency.match(/\d+/)[0]);
                estimatedLatency += latency;
            }

            // Find throughput bottleneck
            if (component.template.constraints.max_throughput) {
                const throughput = this.parseThroughput(component.template.constraints.max_throughput);
                if (throughput < throughputBottleneck) {
                    throughputBottleneck = throughput;
                }
            }
        });

        return {
            estimatedMonthlyCost: totalCost,
            estimatedLatency: `${estimatedLatency}ms`,
            throughputBottleneck: throughputBottleneck === Number.MAX_SAFE_INTEGER ? 'N/A' : `${throughputBottleneck} RPS`,
            scalabilityScore: this.calculateScalabilityScore(),
            reliabilityScore: this.calculateReliabilityScore()
        };
    }

    parseThroughput(throughputStr) {
        const match = throughputStr.match(/(\d+)([KM]?)/);
        if (!match) return 0;
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        if (unit === 'K') return value * 1000;
        if (unit === 'M') return value * 1000000;
        return value;
    }

    calculateScalabilityScore() {
        let score = 100;
        
        // Deduct points for single points of failure
        const criticalComponents = this.findCriticalComponents();
        score -= criticalComponents.length * 20;
        
        // Add points for load balancer
        if (this.hasComponentType('load_balancer')) score += 10;
        
        // Add points for caching
        if (this.hasComponentType('cache')) score += 10;
        
        // Add points for message queues (async processing)
        if (this.hasComponentType('message_queue')) score += 5;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateReliabilityScore() {
        let score = 100;
        
        // Check for redundancy
        const componentTypes = new Set();
        this.components.forEach(component => {
            componentTypes.add(component.type);
        });
        
        // Deduct points for lack of redundancy in critical components
        if (this.hasComponentType('database') && this.countComponentType('database') === 1) {
            score -= 25;
        }
        
        if (this.hasComponentType('web_server') && this.countComponentType('web_server') === 1) {
            score -= 15;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    findCriticalComponents() {
        const critical = [];
        
        this.components.forEach((component, id) => {
            const incomingConnections = this.getIncomingConnections(id);
            const outgoingConnections = this.getOutgoingConnections(id);
            
            if (incomingConnections.length > 2 && outgoingConnections.length > 2) {
                critical.push(component.template);
            }
        });
        
        return critical;
    }

    hasComponentType(type) {
        for (const component of this.components.values()) {
            if (component.type === type) return true;
        }
        return false;
    }

    countComponentType(type) {
        let count = 0;
        this.components.forEach(component => {
            if (component.type === type) count++;
        });
        return count;
    }

    getIncomingConnections(componentId) {
        const incoming = [];
        this.connections.forEach((connection, id) => {
            if (connection.target === componentId) {
                incoming.push(connection);
            }
        });
        return incoming;
    }

    getOutgoingConnections(componentId) {
        const outgoing = [];
        this.connections.forEach((connection, id) => {
            if (connection.source === componentId) {
                outgoing.push(connection);
            }
        });
        return outgoing;
    }

    calculateDesignScore(issues, warnings, suggestions) {
        let score = 100;
        score -= issues.length * 25;
        score -= warnings.length * 10;
        score -= suggestions.length * 5;
        return Math.max(0, score);
    }

    displayValidationResults(validation) {
        const resultsContainer = document.getElementById('validation-results');
        if (!resultsContainer) return;

        const statusClass = validation.isValid ? 'valid' : 'invalid';
        const statusIcon = validation.isValid ? '✅' : '❌';
        const statusText = validation.isValid ? 'Design is valid' : 'Design has issues';

        resultsContainer.innerHTML = `
            <div class="validation-header ${statusClass}">
                <span class="validation-icon">${statusIcon}</span>
                <span class="validation-status">${statusText}</span>
                <span class="validation-score">Score: ${validation.score}/100</span>
            </div>
            
            ${validation.issues.length > 0 ? `
                <div class="validation-section issues">
                    <h4>Issues (Must Fix)</h4>
                    <ul>${validation.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                </div>
            ` : ''}
            
            ${validation.warnings.length > 0 ? `
                <div class="validation-section warnings">
                    <h4>Warnings</h4>
                    <ul>${validation.warnings.map(warning => `<li>${warning}</li>`).join('')}</ul>
                </div>
            ` : ''}
            
            ${validation.suggestions.length > 0 ? `
                <div class="validation-section suggestions">
                    <h4>Suggestions</h4>
                    <ul>${validation.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}</ul>
                </div>
            ` : ''}
            
            <div class="validation-section metrics">
                <h4>System Metrics</h4>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">Est. Monthly Cost:</span>
                        <span class="metric-value">$${validation.metrics.estimatedMonthlyCost}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Est. Latency:</span>
                        <span class="metric-value">${validation.metrics.estimatedLatency}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Throughput Bottleneck:</span>
                        <span class="metric-value">${validation.metrics.throughputBottleneck}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Scalability Score:</span>
                        <span class="metric-value">${validation.metrics.scalabilityScore}/100</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Reliability Score:</span>
                        <span class="metric-value">${validation.metrics.reliabilityScore}/100</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateMetrics() {
        if (!this.options.showMetrics) return;

        const metricsPanel = document.getElementById('metrics-panel');
        if (!metricsPanel) return;

        const metrics = this.calculateSystemMetrics();
        
        metricsPanel.innerHTML = `
            <h3 class="metrics-title">System Metrics</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Components</div>
                    <div class="metric-number">${this.components.size}</div>
                    <div class="metric-status">${this.components.size > 0 ? 'Active' : 'Empty'}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Connections</div>
                    <div class="metric-number">${this.connections.size}</div>
                    <div class="metric-status">${this.connections.size > 0 ? 'Connected' : 'None'}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Monthly Cost</div>
                    <div class="metric-number">$${metrics.estimatedMonthlyCost}</div>
                    <div class="metric-status ${metrics.estimatedMonthlyCost > 500 ? 'warning' : 'good'}">
                        ${metrics.estimatedMonthlyCost > 500 ? 'High' : 'Reasonable'}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Scalability</div>
                    <div class="metric-number">${metrics.scalabilityScore}</div>
                    <div class="metric-status ${metrics.scalabilityScore < 60 ? 'critical' : metrics.scalabilityScore < 80 ? 'warning' : 'good'}">
                        ${metrics.scalabilityScore < 60 ? 'Poor' : metrics.scalabilityScore < 80 ? 'Fair' : 'Good'}
                    </div>
                </div>
            </div>
        `;
    }

    showComponentProperties(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        const propertiesPanel = document.getElementById('component-properties');
        if (!propertiesPanel) return;

        const template = component.template;
        
        propertiesPanel.innerHTML = `
            <h3>${template.name} Properties</h3>
            <div class="properties-grid">
                ${Object.entries(template.properties).map(([key, value]) => `
                    <div class="property-item">
                        <label>${key.replace(/_/g, ' ').toUpperCase()}:</label>
                        <span>${value}</span>
                    </div>
                `).join('')}
            </div>
            
            <h4>Constraints</h4>
            <div class="constraints-grid">
                ${Object.entries(template.constraints).map(([key, value]) => `
                    <div class="constraint-item">
                        <label>${key.replace(/_/g, ' ').toUpperCase()}:</label>
                        <span>${value}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="property-actions">
                <button class="btn-secondary" onclick="designCanvas.editComponent('${componentId}')">
                    Edit Properties
                </button>
                <button class="btn-danger" onclick="designCanvas.deleteComponent('${componentId}')">
                    Delete Component
                </button>
            </div>
        `;

        propertiesPanel.style.display = 'block';
    }

    hideComponentProperties() {
        const propertiesPanel = document.getElementById('component-properties');
        if (propertiesPanel) {
            propertiesPanel.style.display = 'none';
        }
    }

    editComponent(componentId) {
        // Implementation for editing component properties
        console.log(`Editing component: ${componentId}`);
    }

    deleteComponent(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        // Remove all connections
        [...component.connections].forEach(connectionId => {
            this.deleteConnection(connectionId);
        });

        // Remove component from stage
        component.group.destroy();
        this.components.delete(componentId);

        this.layer.batchDraw();
        this.hideComponentProperties();
        this.updateMetrics();

        if (this.options.realTimeValidation) {
            this.validateDesign();
        }
    }

    deleteConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        // Remove connection from components
        const sourceComponent = this.components.get(connection.source);
        const targetComponent = this.components.get(connection.target);

        if (sourceComponent) {
            const index = sourceComponent.connections.indexOf(connectionId);
            if (index > -1) sourceComponent.connections.splice(index, 1);
        }

        if (targetComponent) {
            const index = targetComponent.connections.indexOf(connectionId);
            if (index > -1) targetComponent.connections.splice(index, 1);
        }

        // Remove connection from stage
        connection.group.destroy();
        this.connections.delete(connectionId);
    }

    exportDesign() {
        const designData = {
            components: Array.from(this.components.entries()).map(([id, component]) => ({
                id,
                type: component.type,
                position: {
                    x: component.group.x(),
                    y: component.group.y()
                },
                properties: component.template.properties
            })),
            connections: Array.from(this.connections.entries()).map(([id, connection]) => ({
                id,
                source: connection.source,
                target: connection.target
            })),
            validation: this.validateDesign()
        };

        // Create download link
        const dataStr = JSON.stringify(designData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `system-design-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the entire design? This cannot be undone.')) {
            this.components.clear();
            this.connections.clear();
            this.layer.destroyChildren();
            this.layer.batchDraw();
            this.hideComponentProperties();
            this.updateMetrics();
        }
    }
}

// Initialize design canvas when DOM is loaded
let designCanvas;

document.addEventListener('DOMContentLoaded', function() {
    const canvasElement = document.getElementById('design-canvas');
    if (canvasElement) {
        designCanvas = new InteractiveDesignCanvas(canvasElement, {
            showGrid: true,
            snapToGrid: true,
            showMetrics: true,
            realTimeValidation: true
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveDesignCanvas;
}