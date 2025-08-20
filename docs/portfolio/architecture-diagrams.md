# Architecture Diagrams for Technical Portfolios

!!! info "Professional System Design Visualization"
    Master the art of creating compelling architecture diagrams that showcase your system design thinking and technical communication skills for Amazon L6/L7 interviews.

## Overview

Architecture diagrams are critical for demonstrating your ability to think systematically, communicate complex technical concepts, and design scalable solutions. This guide provides practical templates and examples for creating interview-ready diagrams.

## Diagram Types for Technical Interviews

### 1. C4 Model Diagrams

The C4 model provides a hierarchical approach to documenting software architecture at different levels of abstraction.

#### Level 1: System Context Diagram
**Purpose**: Show how your system fits into the overall landscape  
**Audience**: Non-technical stakeholders, executives  
**Focus**: External dependencies and user interactions

```mermaid
graph TB
    U1[Customer] --> S[E-commerce Platform]
    U2[Admin] --> S
    S --> P[Payment Gateway]
    S --> I[Inventory Service]
    S --> E[Email Service]
    S --> A[Analytics Platform]
```

#### Level 2: Container Diagram
**Purpose**: Show high-level technology choices and responsibilities  
**Audience**: Technical team leads, architects  
**Focus**: Applications, databases, services

```mermaid
graph TB
    subgraph "E-commerce Platform"
        W[Web Application<br/>React SPA]
        API[API Gateway<br/>Node.js]
        US[User Service<br/>Java Spring]
        OS[Order Service<br/>Python FastAPI]
        PS[Payment Service<br/>Go]
        
        DB1[(User Database<br/>PostgreSQL)]
        DB2[(Order Database<br/>MongoDB)]
        DB3[(Cache<br/>Redis)]
    end
    
    U[Customer] --> W
    W --> API
    API --> US
    API --> OS
    API --> PS
    US --> DB1
    OS --> DB2
    PS --> DB3
```

#### Level 3: Component Diagram
**Purpose**: Show internal structure of a container  
**Audience**: Developers, technical architects  
**Focus**: Classes, interfaces, modules

### 2. Data Flow Diagrams

**Purpose**: Show how data moves through your system  
**Use Cases**: ETL pipelines, real-time processing, batch jobs

```mermaid
graph LR
    A[Data Sources] --> B[Ingestion Layer]
    B --> C[Stream Processing]
    B --> D[Batch Processing]
    C --> E[Real-time Analytics]
    D --> F[Data Warehouse]
    E --> G[Dashboards]
    F --> G
    F --> H[ML Pipeline]
    H --> I[Recommendation Engine]
```

### 3. Sequence Diagrams

**Purpose**: Show interactions over time  
**Use Cases**: API workflows, user journeys, error handling

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as API Gateway
    participant O as Order Service
    participant P as Payment Service
    participant I as Inventory Service
    
    U->>W: Place Order
    W->>A: POST /orders
    A->>O: Create Order
    O->>I: Check Inventory
    I-->>O: Inventory Available
    O->>P: Process Payment
    P-->>O: Payment Success
    O-->>A: Order Created
    A-->>W: 201 Created
    W-->>U: Order Confirmation
```

## Tools and Formats

### Recommended Tools

#### 1. Mermaid (Recommended for portfolios)
**Pros**: 
- Version controlled (text-based)
- Integrates with GitHub, GitLab
- Professional output
- Free and open source

**Cons**: 
- Learning curve for syntax
- Limited customization

**Best For**: Technical portfolios, documentation

#### 2. Draw.io (diagrams.net)
**Pros**: 
- Intuitive drag-and-drop interface
- Extensive shape libraries
- Free and web-based
- Good AWS/GCP icon sets

**Cons**: 
- Not version controllable
- Can become messy with complex diagrams

**Best For**: Quick prototyping, presentation diagrams

#### 3. Lucidchart
**Pros**: 
- Professional templates
- Real-time collaboration
- Advanced features
- Excellent for complex diagrams

**Cons**: 
- Paid tool
- Overkill for simple diagrams

**Best For**: Enterprise-level documentation

#### 4. PlantUML
**Pros**: 
- Text-based (version controllable)
- Excellent for sequence diagrams
- Integrates with many IDEs

**Cons**: 
- Steep learning curve
- Limited styling options

**Best For**: Developer-focused documentation

### Tool Selection by Diagram Type

| Diagram Type | Primary Tool | Alternative |
|-------------|-------------|-------------|
| System Context | Mermaid | Draw.io |
| Container | Mermaid | Lucidchart |
| Component | PlantUML | Mermaid |
| Data Flow | Mermaid | Draw.io |
| Sequence | Mermaid | PlantUML |
| Network | Draw.io | Lucidchart |

## L6 vs L7 Diagram Complexity

### L6 Level Expectations

**Scope**: Single service or small system  
**Focus**: Technical implementation details  
**Complexity**: 3-7 components

**Typical L6 Diagrams**:
- Microservice internal architecture
- Database schema designs
- API interaction flows
- CI/CD pipeline designs

**Example L6 Scope**:
```mermaid
graph TB
    subgraph "User Management Service"
        API[REST API<br/>Express.js]
        AUTH[Auth Middleware]
        CTRL[User Controller]
        SVC[User Service]
        REPO[User Repository]
        
        DB[(PostgreSQL)]
        CACHE[(Redis)]
    end
    
    EXT[External Services] --> API
    API --> AUTH
    AUTH --> CTRL
    CTRL --> SVC
    SVC --> REPO
    REPO --> DB
    SVC --> CACHE
```

### L7 Level Expectations

**Scope**: Multiple services, platforms, or organizations  
**Focus**: Strategic architecture decisions  
**Complexity**: 10+ components, cross-team coordination

**Typical L7 Diagrams**:
- Multi-service platform architecture
- Cross-team system integration
- Scalability and reliability patterns
- Organizational system boundaries

**Example L7 Scope**:
```mermaid
graph TB
    subgraph "Frontend Tier"
        WEB[Web Application]
        MOBILE[Mobile App]
        ADMIN[Admin Portal]
    end
    
    subgraph "API Layer"
        GW[API Gateway]
        LB[Load Balancer]
    end
    
    subgraph "Business Services"
        USER[User Service]
        ORDER[Order Service]
        PAYMENT[Payment Service]
        INVENTORY[Inventory Service]
        NOTIFICATION[Notification Service]
    end
    
    subgraph "Data Layer"
        USERDB[(User DB)]
        ORDERDB[(Order DB)]
        WAREHOUSE[(Data Warehouse)]
        CACHE[(Distributed Cache)]
    end
    
    subgraph "External Services"
        PAYPAL[PayPal]
        STRIPE[Stripe]
        EMAIL[Email Service]
        SMS[SMS Gateway]
    end
    
    WEB --> GW
    MOBILE --> GW
    ADMIN --> GW
    GW --> LB
    LB --> USER
    LB --> ORDER
    LB --> PAYMENT
    LB --> INVENTORY
    
    ORDER --> PAYMENT
    ORDER --> INVENTORY
    ORDER --> NOTIFICATION
    
    USER --> USERDB
    ORDER --> ORDERDB
    PAYMENT --> PAYPAL
    PAYMENT --> STRIPE
    NOTIFICATION --> EMAIL
    NOTIFICATION --> SMS
    
    ORDERDB --> WAREHOUSE
    USERDB --> WAREHOUSE
```

## Complete Example Diagrams

### Example 1: Real-time Analytics Platform (L6)

**Context**: Building a real-time analytics dashboard for e-commerce metrics

```mermaid
graph TB
    subgraph "Data Ingestion"
        WEB[Web Events]
        MOBILE[Mobile Events]
        API[API Events]
    end
    
    subgraph "Streaming Pipeline"
        KAFKA[Apache Kafka]
        STORM[Apache Storm]
        REDIS[(Redis Cache)]
    end
    
    subgraph "Storage & Processing"
        OLTP[(PostgreSQL)]
        OLAP[(ClickHouse)]
        ES[(Elasticsearch)]
    end
    
    subgraph "Analytics Layer"
        DASH[Dashboard API]
        ML[ML Models]
        ALERT[Alert Engine]
    end
    
    subgraph "Presentation"
        UI[React Dashboard]
        MOBILE_APP[Mobile App]
    end
    
    WEB --> KAFKA
    MOBILE --> KAFKA
    API --> KAFKA
    
    KAFKA --> STORM
    STORM --> REDIS
    STORM --> OLAP
    STORM --> ES
    
    OLTP --> OLAP
    
    DASH --> REDIS
    DASH --> OLAP
    DASH --> ES
    
    ML --> OLAP
    ALERT --> ES
    
    UI --> DASH
    MOBILE_APP --> DASH
```

**Technical Decisions Highlighted**:
- Kafka for reliable event streaming
- Storm for real-time processing
- ClickHouse for analytical queries
- Redis for sub-second dashboard queries

### Example 2: Microservices Migration (L7)

**Context**: Breaking down a monolith into microservices across multiple teams

```mermaid
graph TB
    subgraph "Legacy System"
        MONO[Monolithic Application<br/>PHP/MySQL]
    end
    
    subgraph "API Gateway Layer"
        KONG[Kong API Gateway]
        AUTH[OAuth2 Service]
    end
    
    subgraph "Customer Domain"
        USER_SVC[User Service<br/>Java/Spring]
        PROFILE_SVC[Profile Service<br/>Node.js]
        USER_DB[(User Database<br/>PostgreSQL)]
        PROFILE_DB[(Profile Database<br/>MongoDB)]
    end
    
    subgraph "Order Domain"
        ORDER_SVC[Order Service<br/>Python/Django]
        CART_SVC[Cart Service<br/>Go]
        ORDER_DB[(Order Database<br/>PostgreSQL)]
        CART_CACHE[(Redis)]
    end
    
    subgraph "Product Domain"
        PRODUCT_SVC[Product Service<br/>Java/Spring]
        INVENTORY_SVC[Inventory Service<br/>C#/.NET]
        PRODUCT_DB[(Product Database<br/>PostgreSQL)]
        INVENTORY_DB[(Inventory Database<br/>SQL Server)]
    end
    
    subgraph "Cross-Cutting Services"
        NOTIFICATION[Notification Service<br/>Node.js]
        ANALYTICS[Analytics Service<br/>Python]
        SEARCH[Search Service<br/>Elasticsearch]
    end
    
    subgraph "Message Bus"
        RABBIT[RabbitMQ]
    end
    
    CLIENT[Client Applications] --> KONG
    KONG --> AUTH
    KONG --> USER_SVC
    KONG --> ORDER_SVC
    KONG --> PRODUCT_SVC
    
    USER_SVC --> USER_DB
    PROFILE_SVC --> PROFILE_DB
    ORDER_SVC --> ORDER_DB
    CART_SVC --> CART_CACHE
    PRODUCT_SVC --> PRODUCT_DB
    INVENTORY_SVC --> INVENTORY_DB
    
    ORDER_SVC --> RABBIT
    USER_SVC --> RABBIT
    PRODUCT_SVC --> RABBIT
    
    RABBIT --> NOTIFICATION
    RABBIT --> ANALYTICS
    RABBIT --> SEARCH
    
    MONO -.->|Gradual Migration| USER_SVC
    MONO -.->|Gradual Migration| ORDER_SVC
    MONO -.->|Gradual Migration| PRODUCT_SVC
```

**Strategic Decisions Highlighted**:
- Domain-driven decomposition
- Technology diversity by team expertise
- Event-driven communication via message bus
- Gradual migration strategy

### Example 3: High-Availability Content Delivery (L7)

**Context**: Global content delivery platform with 99.99% uptime requirement

```mermaid
graph TB
    subgraph "CDN Layer"
        CF[CloudFlare CDN]
        AWS_CF[AWS CloudFront]
    end
    
    subgraph "Load Balancing"
        GLB[Global Load Balancer<br/>Route 53]
        ALB_US[Application Load Balancer<br/>US-East]
        ALB_EU[Application Load Balancer<br/>EU-West]
        ALB_ASIA[Application Load Balancer<br/>Asia-Pacific]
    end
    
    subgraph "US-East Region"
        US_APP1[App Server 1]
        US_APP2[App Server 2]
        US_APP3[App Server 3]
        US_DB_PRIMARY[(Primary DB<br/>PostgreSQL)]
        US_REDIS[(Redis Cluster)]
    end
    
    subgraph "EU-West Region"
        EU_APP1[App Server 1]
        EU_APP2[App Server 2]
        EU_DB_REPLICA[(Read Replica<br/>PostgreSQL)]
        EU_REDIS[(Redis Cluster)]
    end
    
    subgraph "Asia-Pacific Region"
        ASIA_APP1[App Server 1]
        ASIA_APP2[App Server 2]
        ASIA_DB_REPLICA[(Read Replica<br/>PostgreSQL)]
        ASIA_REDIS[(Redis Cluster)]
    end
    
    subgraph "Storage"
        S3_US[S3 Bucket US]
        S3_EU[S3 Bucket EU]
        S3_ASIA[S3 Bucket Asia]
    end
    
    subgraph "Monitoring & Alerting"
        DATADOG[DataDog]
        PAGER[PagerDuty]
        GRAFANA[Grafana]
    end
    
    CLIENT[Global Users] --> CF
    CLIENT --> AWS_CF
    CF --> GLB
    AWS_CF --> GLB
    
    GLB --> ALB_US
    GLB --> ALB_EU
    GLB --> ALB_ASIA
    
    ALB_US --> US_APP1
    ALB_US --> US_APP2
    ALB_US --> US_APP3
    
    ALB_EU --> EU_APP1
    ALB_EU --> EU_APP2
    
    ALB_ASIA --> ASIA_APP1
    ALB_ASIA --> ASIA_APP2
    
    US_APP1 --> US_DB_PRIMARY
    US_APP2 --> US_DB_PRIMARY
    US_APP3 --> US_DB_PRIMARY
    US_APP1 --> US_REDIS
    US_APP2 --> US_REDIS
    US_APP3 --> US_REDIS
    
    EU_APP1 --> EU_DB_REPLICA
    EU_APP2 --> EU_DB_REPLICA
    EU_APP1 --> EU_REDIS
    EU_APP2 --> EU_REDIS
    
    ASIA_APP1 --> ASIA_DB_REPLICA
    ASIA_APP2 --> ASIA_DB_REPLICA
    ASIA_APP1 --> ASIA_REDIS
    ASIA_APP2 --> ASIA_REDIS
    
    US_DB_PRIMARY -.->|Async Replication| EU_DB_REPLICA
    US_DB_PRIMARY -.->|Async Replication| ASIA_DB_REPLICA
    
    US_APP1 --> S3_US
    EU_APP1 --> S3_EU
    ASIA_APP1 --> S3_ASIA
    
    ALL_SERVICES[All Services] --> DATADOG
    DATADOG --> PAGER
    DATADOG --> GRAFANA
```

**High-Availability Decisions Highlighted**:
- Multi-region deployment with failover
- CDN layering for global performance
- Database replication strategy
- Comprehensive monitoring and alerting

## Common Mistakes to Avoid

### 1. Overcomplicated Diagrams
**Problem**: Too many details, cluttered layout  
**Solution**: Use hierarchical approach (C4 model)

**Bad Example**:
- Single diagram with 20+ components
- All implementation details shown at once
- No clear information hierarchy

**Good Example**:
- Context diagram for high-level view
- Container diagram for technology choices
- Component diagram for detailed implementation

### 2. Inconsistent Notation
**Problem**: Mixed styles, unclear symbols  
**Solution**: Establish and follow consistent conventions

**Conventions to Follow**:
- Consistent shapes for similar components
- Clear labeling of all components
- Standardized colors and fonts
- Legend when using custom symbols

### 3. Missing Key Information
**Problem**: Unclear relationships, missing context  
**Solution**: Include essential metadata

**Always Include**:
- Data flow directions
- Technology choices
- Scalability indicators
- Security boundaries
- Performance characteristics

### 4. No Focus on Trade-offs
**Problem**: Showing only the final solution  
**Solution**: Highlight key decisions and alternatives

**Include in Annotations**:
- Why specific technologies were chosen
- What alternatives were considered
- Performance/cost/complexity trade-offs
- Future scalability considerations

### 5. Static Documentation
**Problem**: Diagrams become outdated quickly  
**Solution**: Make diagrams part of development process

**Best Practices**:
- Version control diagram source files
- Update diagrams with code changes
- Include diagrams in code reviews
- Automate generation where possible

## Diagram Creation Workflow

### 1. Planning Phase
1. **Define Purpose**: What story does this diagram tell?
2. **Identify Audience**: Who will review this in interviews?
3. **Choose Abstraction Level**: Context, Container, or Component?
4. **Select Tool**: Based on complexity and maintenance needs

### 2. Creation Phase
1. **Start Simple**: Begin with high-level components
2. **Add Details Gradually**: Layer in complexity
3. **Focus on Flow**: Show how data/requests move
4. **Highlight Decisions**: Annotate key architectural choices

### 3. Review Phase
1. **Check Completeness**: All major components included?
2. **Verify Accuracy**: Does it match actual implementation?
3. **Test Clarity**: Can someone else understand it?
4. **Update Documentation**: Keep supporting docs in sync

### 4. Interview Preparation
1. **Practice Explanation**: Walk through diagram verbally
2. **Prepare for Questions**: Anticipate deep dives on decisions
3. **Know Alternatives**: Be ready to discuss trade-offs
4. **Update Examples**: Keep portfolio current with recent work

## Portfolio Integration

### GitHub Repository Structure
```
portfolio/
├── diagrams/
│   ├── context/
│   │   ├── ecommerce-platform.mmd
│   │   └── analytics-system.mmd
│   ├── containers/
│   │   ├── user-service.mmd
│   │   └── order-service.mmd
│   └── components/
│       ├── auth-module.mmd
│       └── payment-processor.mmd
├── images/
│   ├── ecommerce-context.png
│   └── analytics-containers.png
└── README.md
```

### Documentation Standards
Each diagram should include:
- **Purpose**: What problem does this solve?
- **Context**: When was this created and why?
- **Decisions**: Key architectural choices made
- **Metrics**: Performance/scale achieved
- **Lessons**: What would you do differently?

### Interview Presentation
1. **Start with Context**: Business problem being solved
2. **Walk Through Layers**: Top-down explanation
3. **Highlight Decisions**: Why specific choices were made
4. **Discuss Trade-offs**: Alternative approaches considered
5. **Share Results**: Impact and lessons learned

Remember: Your diagrams should tell a story about your problem-solving process, not just document the final solution. Focus on demonstrating your architectural thinking, decision-making process, and ability to communicate complex technical concepts clearly.