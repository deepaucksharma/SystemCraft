# Performance Engineering for Amazon-Scale Systems

## Introduction to Performance Engineering

Performance engineering at Amazon scale requires deep understanding of queueing theory, system bottleneck identification, and mathematical modeling. This module covers advanced performance concepts essential for L6/L7 system design interviews, focusing on practical applications in distributed systems serving billions of users.

---

## Queueing Theory Applications

### Fundamental Queueing Models

#### Little's Law and System Analysis

Little's Law states that the average number of customers in a system equals the arrival rate times the average time in the system: **L = λW**

```python
class LittlesLawAnalyzer:
    """Little's Law application for system performance analysis"""
    
    def __init__(self):
        self.measurements = []
    
    def calculate_system_metrics(self, arrival_rate, avg_service_time, service_rate=None):
        """Calculate key system metrics using Little's Law"""
        if service_rate is None:
            service_rate = 1.0 / avg_service_time
        
        # Utilization (ρ = λ/μ)
        utilization = arrival_rate / service_rate
        
        if utilization >= 1.0:
            return {
                'error': 'System is unstable - arrival rate >= service rate',
                'utilization': utilization
            }
        
        # M/M/1 Queue formulas
        avg_customers_in_system = utilization / (1 - utilization)  # L
        avg_wait_time = avg_customers_in_system / arrival_rate        # W (by Little's Law)
        avg_queue_length = (utilization ** 2) / (1 - utilization)    # Lq
        avg_wait_in_queue = avg_queue_length / arrival_rate          # Wq
        
        return {
            'utilization': utilization,
            'avg_customers_in_system': avg_customers_in_system,
            'avg_total_time': avg_wait_time,
            'avg_queue_length': avg_queue_length,
            'avg_wait_in_queue': avg_wait_in_queue,
            'avg_service_time': avg_service_time
        }
    
    def analyze_amazon_service(self, request_rate_per_second, avg_processing_time_ms):
        """Analyze Amazon service performance"""
        # Convert to consistent units
        arrival_rate = request_rate_per_second
        avg_service_time = avg_processing_time_ms / 1000.0  # Convert to seconds
        
        metrics = self.calculate_system_metrics(arrival_rate, avg_service_time)
        
        if 'error' in metrics:
            return metrics
        
        # Amazon-specific insights
        analysis = {
            'system_metrics': metrics,
            'amazon_insights': {
                'p99_wait_time_estimate': metrics['avg_wait_in_queue'] * 4.65,  # Approximation for exponential
                'recommended_capacity': arrival_rate / 0.7,  # Keep utilization under 70%
                'scale_up_threshold': metrics['utilization'],
                'queue_backlog_ms': metrics['avg_queue_length'] * (avg_service_time * 1000)
            }
        }
        
        return analysis

# Example usage for Amazon scale
def analyze_dynamo_read_path():
    """Analyze DynamoDB read path performance"""
    analyzer = LittlesLawAnalyzer()
    
    # Typical DynamoDB read characteristics
    request_rate = 10000  # 10K RPS
    avg_latency_ms = 2.5  # 2.5ms average latency
    
    analysis = analyzer.analyze_amazon_service(request_rate, avg_latency_ms)
    
    print("DynamoDB Read Path Analysis:")
    print(f"Utilization: {analysis['system_metrics']['utilization']:.2%}")
    print(f"Average queue length: {analysis['system_metrics']['avg_queue_length']:.1f}")
    print(f"P99 wait time estimate: {analysis['amazon_insights']['p99_wait_time_estimate']:.1f}ms")
    print(f"Recommended capacity: {analysis['amazon_insights']['recommended_capacity']:.0f} RPS")
```

#### M/M/c Queue Model (Multiple Servers)

```python
import math
from scipy.special import factorial

class MultiServerQueue:
    """M/M/c queue analysis for multi-server systems"""
    
    def __init__(self, num_servers, arrival_rate, service_rate_per_server):
        self.c = num_servers
        self.lambda_rate = arrival_rate
        self.mu = service_rate_per_server
        self.rho = arrival_rate / service_rate_per_server  # Traffic intensity
        self.system_utilization = self.rho / self.c
        
        if self.system_utilization >= 1.0:
            raise ValueError("System is unstable - utilization >= 1.0")
    
    def calculate_probability_zero(self):
        """Calculate probability of zero customers in system (P0)"""
        sum_term1 = sum(
            (self.rho ** n) / factorial(n) 
            for n in range(self.c)
        )
        
        term2 = (
            ((self.rho ** self.c) / factorial(self.c)) *
            (1 / (1 - self.system_utilization))
        )
        
        p0 = 1 / (sum_term1 + term2)
        return p0
    
    def calculate_performance_metrics(self):
        """Calculate all performance metrics for M/M/c queue"""
        p0 = self.calculate_probability_zero()
        
        # Probability that an arriving customer must wait
        prob_wait = (
            ((self.rho ** self.c) / factorial(self.c)) *
            p0 * (1 / (1 - self.system_utilization))
        )
        
        # Average number of customers waiting in queue
        lq = prob_wait * self.system_utilization / (1 - self.system_utilization)
        
        # Average number of customers in system
        l = lq + self.rho
        
        # Average wait time in queue (by Little's Law)
        wq = lq / self.lambda_rate
        
        # Average total time in system
        w = wq + (1 / self.mu)
        
        return {
            'probability_zero': p0,
            'probability_wait': prob_wait,
            'avg_queue_length': lq,
            'avg_customers_in_system': l,
            'avg_wait_in_queue': wq,
            'avg_total_time': w,
            'system_utilization': self.system_utilization,
            'server_utilization': self.rho / self.c
        }

# Amazon ELB analysis example
def analyze_elb_performance():
    """Analyze Elastic Load Balancer performance"""
    # ELB with 4 backend servers
    elb_queue = MultiServerQueue(
        num_servers=4,
        arrival_rate=1000,  # 1000 RPS
        service_rate_per_server=300  # Each server can handle 300 RPS
    )
    
    metrics = elb_queue.calculate_performance_metrics()
    
    print("Amazon ELB Performance Analysis:")
    print(f"System utilization: {metrics['system_utilization']:.1%}")
    print(f"Probability of waiting: {metrics['probability_wait']:.1%}")
    print(f"Average queue length: {metrics['avg_queue_length']:.2f}")
    print(f"Average response time: {metrics['avg_total_time']*1000:.1f}ms")
```

### Advanced Queueing Networks

```python
class QueueingNetwork:
    """Analysis of queueing networks for distributed systems"""
    
    def __init__(self):
        self.nodes = {}
        self.routing_matrix = {}
    
    def add_node(self, node_id, service_rate, num_servers=1):
        """Add a node to the queueing network"""
        self.nodes[node_id] = {
            'service_rate': service_rate,
            'num_servers': num_servers,
            'arrival_rate': 0,
            'utilization': 0
        }
    
    def set_routing_probability(self, from_node, to_node, probability):
        """Set routing probability between nodes"""
        if from_node not in self.routing_matrix:
            self.routing_matrix[from_node] = {}
        self.routing_matrix[from_node][to_node] = probability
    
    def solve_network(self, external_arrivals):
        """Solve queueing network using traffic equations"""
        # Initialize arrival rates with external arrivals
        for node_id in self.nodes:
            self.nodes[node_id]['arrival_rate'] = external_arrivals.get(node_id, 0)
        
        # Iteratively solve traffic equations
        max_iterations = 100
        tolerance = 1e-6
        
        for iteration in range(max_iterations):
            old_rates = {node: self.nodes[node]['arrival_rate'] for node in self.nodes}
            
            # Update arrival rates based on routing
            for from_node, routes in self.routing_matrix.items():
                departure_rate = self.nodes[from_node]['arrival_rate']
                
                for to_node, probability in routes.items():
                    additional_traffic = departure_rate * probability
                    self.nodes[to_node]['arrival_rate'] += additional_traffic
            
            # Check convergence
            converged = all(
                abs(self.nodes[node]['arrival_rate'] - old_rates[node]) < tolerance
                for node in self.nodes
            )
            
            if converged:
                break
        
        # Calculate utilizations and performance metrics
        results = {}
        for node_id, node in self.nodes.items():
            utilization = node['arrival_rate'] / (node['service_rate'] * node['num_servers'])
            
            if utilization >= 1.0:
                results[node_id] = {'error': 'Node overloaded', 'utilization': utilization}
            else:
                # M/M/c calculations for each node
                if node['num_servers'] == 1:
                    avg_customers = utilization / (1 - utilization)
                    avg_response_time = avg_customers / node['arrival_rate']
                else:
                    # Use M/M/c formulas (simplified)
                    avg_customers = utilization + (utilization ** (node['num_servers'] + 1)) / (1 - utilization)
                    avg_response_time = avg_customers / node['arrival_rate']
                
                results[node_id] = {
                    'arrival_rate': node['arrival_rate'],
                    'utilization': utilization,
                    'avg_customers': avg_customers,
                    'avg_response_time': avg_response_time
                }
        
        return results

# Amazon service mesh analysis
def analyze_microservice_network():
    """Analyze Amazon microservice network performance"""
    network = QueueingNetwork()
    
    # Add nodes representing microservices
    network.add_node('api_gateway', service_rate=5000, num_servers=3)
    network.add_node('user_service', service_rate=2000, num_servers=2)
    network.add_node('product_service', service_rate=1500, num_servers=2)
    network.add_node('order_service', service_rate=1000, num_servers=2)
    network.add_node('payment_service', service_rate=800, num_servers=1)
    network.add_node('database', service_rate=3000, num_servers=1)
    
    # Set routing probabilities
    network.set_routing_probability('api_gateway', 'user_service', 0.3)
    network.set_routing_probability('api_gateway', 'product_service', 0.4)
    network.set_routing_probability('api_gateway', 'order_service', 0.3)
    network.set_routing_probability('order_service', 'payment_service', 1.0)
    network.set_routing_probability('user_service', 'database', 0.8)
    network.set_routing_probability('product_service', 'database', 0.6)
    network.set_routing_probability('order_service', 'database', 0.9)
    network.set_routing_probability('payment_service', 'database', 0.7)
    
    # External traffic enters through API gateway
    external_arrivals = {'api_gateway': 1000}  # 1000 RPS
    
    results = network.solve_network(external_arrivals)
    
    print("Amazon Microservice Network Analysis:")
    for node_id, metrics in results.items():
        if 'error' in metrics:
            print(f"{node_id}: {metrics['error']} (utilization: {metrics['utilization']:.1%})")
        else:
            print(f"{node_id}: {metrics['utilization']:.1%} util, {metrics['avg_response_time']*1000:.1f}ms response")
```

---

## System Bottleneck Identification

### CPU Bottleneck Analysis

```python
import psutil
import time
import statistics
from collections import deque

class CPUBottleneckAnalyzer:
    """Advanced CPU performance analysis for identifying bottlenecks"""
    
    def __init__(self, sampling_interval=1.0):
        self.sampling_interval = sampling_interval
        self.cpu_metrics = deque(maxlen=100)
        self.process_metrics = {}
    
    def collect_cpu_metrics(self, duration=60):
        """Collect CPU metrics over specified duration"""
        start_time = time.time()
        
        while time.time() - start_time < duration:
            # Overall CPU metrics
            cpu_percent = psutil.cpu_percent(interval=None)
            cpu_count = psutil.cpu_count()
            load_avg = psutil.getloadavg() if hasattr(psutil, 'getloadavg') else (0, 0, 0)
            
            # Per-core metrics
            cpu_per_core = psutil.cpu_percent(percpu=True)
            
            # Context switches and interrupts
            cpu_stats = psutil.cpu_stats()
            
            metrics = {
                'timestamp': time.time(),
                'cpu_percent': cpu_percent,
                'cpu_count': cpu_count,
                'load_avg_1m': load_avg[0],
                'load_avg_5m': load_avg[1],
                'load_avg_15m': load_avg[2],
                'cpu_per_core': cpu_per_core,
                'context_switches': cpu_stats.ctx_switches,
                'interrupts': cpu_stats.interrupts,
                'soft_interrupts': cpu_stats.soft_interrupts
            }
            
            self.cpu_metrics.append(metrics)
            time.sleep(self.sampling_interval)
    
    def analyze_cpu_bottlenecks(self):
        """Analyze collected metrics for CPU bottlenecks"""
        if not self.cpu_metrics:
            return {"error": "No metrics collected"}
        
        cpu_utilizations = [m['cpu_percent'] for m in self.cpu_metrics]
        load_avgs = [m['load_avg_1m'] for m in self.cpu_metrics]
        
        analysis = {
            'cpu_utilization': {
                'avg': statistics.mean(cpu_utilizations),
                'p95': self._percentile(cpu_utilizations, 95),
                'p99': self._percentile(cpu_utilizations, 99),
                'max': max(cpu_utilizations)
            },
            'load_average': {
                'avg': statistics.mean(load_avgs),
                'max': max(load_avgs),
                'ratio_to_cores': max(load_avgs) / self.cpu_metrics[-1]['cpu_count']
            },
            'bottleneck_indicators': []
        }
        
        # Identify bottlenecks
        if analysis['cpu_utilization']['p95'] > 80:
            analysis['bottleneck_indicators'].append({
                'type': 'high_cpu_utilization',
                'severity': 'critical' if analysis['cpu_utilization']['p95'] > 90 else 'warning',
                'description': f"CPU utilization P95 is {analysis['cpu_utilization']['p95']:.1f}%"
            })
        
        if analysis['load_average']['ratio_to_cores'] > 1.0:
            analysis['bottleneck_indicators'].append({
                'type': 'cpu_overload',
                'severity': 'critical',
                'description': f"Load average {analysis['load_average']['max']:.2f} exceeds CPU count"
            })
        
        # Check for uneven core distribution
        latest_cores = self.cpu_metrics[-1]['cpu_per_core']
        core_variance = statistics.variance(latest_cores) if len(latest_cores) > 1 else 0
        
        if core_variance > 100:  # High variance indicates uneven load
            analysis['bottleneck_indicators'].append({
                'type': 'uneven_cpu_distribution',
                'severity': 'warning',
                'description': f"High variance in per-core utilization: {core_variance:.1f}"
            })
        
        return analysis
    
    @staticmethod
    def _percentile(data, percentile):
        """Calculate percentile value"""
        sorted_data = sorted(data)
        index = int((percentile / 100.0) * len(sorted_data))
        return sorted_data[min(index, len(sorted_data) - 1)]

# Amazon EC2 CPU optimization
class EC2CPUOptimizer:
    """Optimize EC2 instances for CPU performance"""
    
    def __init__(self):
        self.instance_types = {
            # CPU optimized instances
            'c5.large': {'vcpus': 2, 'baseline_performance': 100, 'burst': False},
            'c5.xlarge': {'vcpus': 4, 'baseline_performance': 100, 'burst': False},
            'c5.2xlarge': {'vcpus': 8, 'baseline_performance': 100, 'burst': False},
            'c5.4xlarge': {'vcpus': 16, 'baseline_performance': 100, 'burst': False},
            
            # Burstable instances
            't3.medium': {'vcpus': 2, 'baseline_performance': 20, 'burst': True},
            't3.large': {'vcpus': 2, 'baseline_performance': 30, 'burst': True},
            't3.xlarge': {'vcpus': 4, 'baseline_performance': 40, 'burst': True},
        }
    
    def recommend_instance_type(self, workload_profile):
        """Recommend optimal EC2 instance type based on workload"""
        avg_cpu = workload_profile.get('avg_cpu_percent', 0)
        p95_cpu = workload_profile.get('p95_cpu_percent', 0)
        sustained_load = workload_profile.get('sustained_load', True)
        parallel_threads = workload_profile.get('parallel_threads', 1)
        
        recommendations = []
        
        for instance_type, specs in self.instance_types.items():
            # Check if instance can handle the load
            if specs['burst'] and not sustained_load:
                # Burstable instance - good for variable loads
                if avg_cpu <= specs['baseline_performance'] and p95_cpu <= 100:
                    cost_effectiveness = self._calculate_cost_effectiveness(instance_type, workload_profile)
                    recommendations.append({
                        'instance_type': instance_type,
                        'match_score': self._calculate_match_score(specs, workload_profile),
                        'cost_effectiveness': cost_effectiveness,
                        'reasoning': 'Good for variable workloads with burst capability'
                    })
            
            elif not specs['burst']:
                # Non-burstable - good for sustained loads
                required_vcpus = max(1, parallel_threads // 2)  # Rough estimate
                
                if specs['vcpus'] >= required_vcpus and p95_cpu <= 80:
                    cost_effectiveness = self._calculate_cost_effectiveness(instance_type, workload_profile)
                    recommendations.append({
                        'instance_type': instance_type,
                        'match_score': self._calculate_match_score(specs, workload_profile),
                        'cost_effectiveness': cost_effectiveness,
                        'reasoning': 'Good for sustained high-performance workloads'
                    })
        
        # Sort by match score and cost effectiveness
        recommendations.sort(key=lambda x: (x['match_score'], x['cost_effectiveness']), reverse=True)
        
        return recommendations[:3]  # Top 3 recommendations
    
    def _calculate_match_score(self, instance_specs, workload_profile):
        """Calculate how well instance matches workload"""
        score = 0
        
        # CPU capacity match
        required_capacity = workload_profile.get('p95_cpu_percent', 50) / 100.0
        instance_capacity = 1.0 if not instance_specs['burst'] else instance_specs['baseline_performance'] / 100.0
        
        if instance_capacity >= required_capacity:
            score += 50 * (1 - abs(instance_capacity - required_capacity))
        
        # Thread match
        parallel_threads = workload_profile.get('parallel_threads', 1)
        if instance_specs['vcpus'] >= parallel_threads:
            score += 30
        
        # Burst capability match
        if workload_profile.get('sustained_load', True) == (not instance_specs['burst']):
            score += 20
        
        return min(100, score)
    
    def _calculate_cost_effectiveness(self, instance_type, workload_profile):
        """Calculate cost effectiveness (simplified)"""
        # In real implementation, would use actual AWS pricing
        base_costs = {
            'c5.large': 0.085,
            'c5.xlarge': 0.17,
            'c5.2xlarge': 0.34,
            'c5.4xlarge': 0.68,
            't3.medium': 0.0416,
            't3.large': 0.0832,
            't3.xlarge': 0.1664,
        }
        
        cost_per_hour = base_costs.get(instance_type, 0.1)
        performance_ratio = self.instance_types[instance_type]['vcpus']
        
        return performance_ratio / cost_per_hour  # Performance per dollar
```

### Memory Bottleneck Analysis

```python
import gc
import tracemalloc
from collections import defaultdict

class MemoryBottleneckAnalyzer:
    """Advanced memory performance analysis and optimization"""
    
    def __init__(self):
        self.memory_snapshots = []
        self.allocation_patterns = defaultdict(int)
        self.gc_stats = []
    
    def start_memory_profiling(self):
        """Start memory profiling"""
        tracemalloc.start()
        gc.set_debug(gc.DEBUG_STATS)
    
    def take_memory_snapshot(self, label=""):
        """Take a memory snapshot for analysis"""
        if not tracemalloc.is_tracing():
            self.start_memory_profiling()
        
        # System memory stats
        memory_info = psutil.virtual_memory()
        process = psutil.Process()
        process_memory = process.memory_info()
        
        # Python memory stats
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        
        # Garbage collection stats
        gc_counts = gc.get_count()
        
        memory_snapshot = {
            'label': label,
            'timestamp': time.time(),
            'system_memory': {
                'total': memory_info.total,
                'available': memory_info.available,
                'used': memory_info.used,
                'percentage': memory_info.percent
            },
            'process_memory': {
                'rss': process_memory.rss,
                'vms': process_memory.vms,
                'percentage': process.memory_percent()
            },
            'python_memory': {
                'top_allocations': [(stat.traceback.format(), stat.size) for stat in top_stats[:10]],
                'total_traced': sum(stat.size for stat in top_stats)
            },
            'gc_stats': {
                'gen0': gc_counts[0],
                'gen1': gc_counts[1], 
                'gen2': gc_counts[2]
            }
        }
        
        self.memory_snapshots.append(memory_snapshot)
        return memory_snapshot
    
    def analyze_memory_growth(self):
        """Analyze memory growth patterns"""
        if len(self.memory_snapshots) < 2:
            return {"error": "Need at least 2 snapshots"}
        
        first = self.memory_snapshots[0]
        last = self.memory_snapshots[-1]
        
        # Calculate growth rates
        time_diff = last['timestamp'] - first['timestamp']
        
        rss_growth = (last['process_memory']['rss'] - first['process_memory']['rss']) / time_diff
        python_memory_growth = (last['python_memory']['total_traced'] - first['python_memory']['total_traced']) / time_diff
        
        analysis = {
            'time_period': time_diff,
            'memory_growth': {
                'rss_per_second': rss_growth,
                'python_per_second': python_memory_growth,
                'total_growth_mb': (last['process_memory']['rss'] - first['process_memory']['rss']) / (1024 * 1024)
            },
            'current_usage': {
                'rss_mb': last['process_memory']['rss'] / (1024 * 1024),
                'system_percentage': last['process_memory']['percentage']
            },
            'bottleneck_indicators': []
        }
        
        # Identify bottlenecks
        if last['process_memory']['percentage'] > 80:
            analysis['bottleneck_indicators'].append({
                'type': 'high_memory_usage',
                'severity': 'critical',
                'description': f"Process using {last['process_memory']['percentage']:.1f}% of system memory"
            })
        
        if rss_growth > 1024 * 1024:  # More than 1MB/second growth
            analysis['bottleneck_indicators'].append({
                'type': 'memory_leak_suspected',
                'severity': 'critical',
                'description': f"Memory growing at {rss_growth/(1024*1024):.2f} MB/second"
            })
        
        # Analyze GC pressure
        if len(self.memory_snapshots) > 10:
            recent_gc = [s['gc_stats'] for s in self.memory_snapshots[-10:]]
            gc_pressure = self._analyze_gc_pressure(recent_gc)
            
            if gc_pressure['high_pressure']:
                analysis['bottleneck_indicators'].append({
                    'type': 'high_gc_pressure',
                    'severity': 'warning',
                    'description': f"High GC activity detected: {gc_pressure['gen2_collections']}/min"
                })
        
        return analysis
    
    def _analyze_gc_pressure(self, gc_stats):
        """Analyze garbage collection pressure"""
        if len(gc_stats) < 2:
            return {'high_pressure': False}
        
        gen2_start = gc_stats[0]['gen2']
        gen2_end = gc_stats[-1]['gen2']
        collections_per_minute = (gen2_end - gen2_start) * 6  # Assuming 10-second intervals
        
        return {
            'high_pressure': collections_per_minute > 10,
            'gen2_collections': collections_per_minute
        }
    
    def optimize_memory_usage(self, analysis):
        """Provide memory optimization recommendations"""
        recommendations = []
        
        for indicator in analysis.get('bottleneck_indicators', []):
            if indicator['type'] == 'high_memory_usage':
                recommendations.extend([
                    "Consider using memory pooling for frequently allocated objects",
                    "Implement lazy loading for large data structures",
                    "Use generators instead of lists for large datasets",
                    "Add memory monitoring and alerting"
                ])
            
            elif indicator['type'] == 'memory_leak_suspected':
                recommendations.extend([
                    "Review object lifecycle management",
                    "Check for circular references preventing garbage collection",
                    "Implement explicit cleanup in finally blocks",
                    "Use weak references where appropriate"
                ])
            
            elif indicator['type'] == 'high_gc_pressure':
                recommendations.extend([
                    "Reduce object allocation frequency",
                    "Use object pooling for frequently created objects",
                    "Optimize data structures to reduce memory fragmentation",
                    "Consider increasing GC thresholds if appropriate"
                ])
        
        return recommendations

# Amazon-specific memory optimization
class AmazonMemoryOptimizer:
    """Memory optimization strategies for Amazon services"""
    
    def __init__(self):
        self.optimization_strategies = {
            'lambda': self._optimize_lambda_memory,
            'ecs': self._optimize_ecs_memory,
            'ec2': self._optimize_ec2_memory,
            'rds': self._optimize_rds_memory
        }
    
    def _optimize_lambda_memory(self, memory_analysis):
        """Optimize AWS Lambda memory configuration"""
        current_usage = memory_analysis['current_usage']['rss_mb']
        
        # Lambda memory tiers (simplified)
        lambda_tiers = [128, 256, 512, 1024, 2048, 3008]
        
        # Find optimal tier (with 20% headroom)
        required_memory = current_usage * 1.2
        optimal_tier = next((tier for tier in lambda_tiers if tier >= required_memory), 3008)
        
        recommendations = {
            'current_memory': current_usage,
            'recommended_memory': optimal_tier,
            'cost_impact': self._calculate_lambda_cost_impact(current_usage, optimal_tier),
            'performance_impact': 'CPU scales with memory allocation in Lambda'
        }
        
        return recommendations
    
    def _optimize_ecs_memory(self, memory_analysis):
        """Optimize ECS container memory configuration"""
        current_usage = memory_analysis['current_usage']['rss_mb']
        growth_rate = memory_analysis['memory_growth']['rss_per_second']
        
        # Calculate memory with growth buffer
        daily_growth = growth_rate * 86400 / (1024 * 1024)  # MB per day
        recommended_memory = (current_usage + daily_growth * 7) * 1.3  # 7-day buffer + 30% headroom
        
        return {
            'current_memory': current_usage,
            'recommended_memory': recommended_memory,
            'memory_request': recommended_memory * 0.8,  # Request 80% of limit
            'memory_limit': recommended_memory,
            'scaling_recommendation': 'Enable horizontal pod autoscaling based on memory utilization'
        }
    
    def _optimize_ec2_memory(self, memory_analysis):
        """Optimize EC2 instance memory configuration"""
        system_memory_percent = memory_analysis['current_usage']['system_percentage']
        
        if system_memory_percent > 80:
            return {
                'action': 'scale_up',
                'recommendation': 'Upgrade to instance type with more memory',
                'alternatives': ['Use memory-optimized instances (r5, x1)', 'Implement memory caching strategies']
            }
        elif system_memory_percent < 30:
            return {
                'action': 'scale_down',
                'recommendation': 'Consider smaller instance type to reduce costs',
                'cost_savings': 'Potential 20-40% cost reduction'
            }
        else:
            return {
                'action': 'optimize',
                'recommendation': 'Current memory allocation is appropriate',
                'monitoring': 'Continue monitoring for changes in usage patterns'
            }
    
    def _optimize_rds_memory(self, memory_analysis):
        """Optimize RDS memory configuration"""
        return {
            'buffer_pool': 'Ensure InnoDB buffer pool is 70-80% of available memory',
            'query_cache': 'Optimize query cache size based on workload',
            'connections': 'Tune max_connections to prevent memory exhaustion'
        }
    
    def _calculate_lambda_cost_impact(self, current_mb, recommended_mb):
        """Calculate cost impact of Lambda memory change"""
        # Simplified cost calculation
        cost_per_gb_ms = 0.0000166667  # AWS pricing (approximate)
        
        current_cost_factor = current_mb / 1024.0
        recommended_cost_factor = recommended_mb / 1024.0
        
        cost_increase = (recommended_cost_factor - current_cost_factor) / current_cost_factor
        
        return {
            'percentage_change': cost_increase * 100,
            'note': 'Higher memory allocation may reduce execution time, potentially reducing overall cost'
        }
```

### I/O Bottleneck Analysis

```python
import os
import time
from pathlib import Path

class IOBottleneckAnalyzer:
    """Comprehensive I/O performance analysis for identifying bottlenecks"""
    
    def __init__(self):
        self.io_metrics = []
        self.file_operations = []
        self.network_operations = []
    
    def monitor_disk_io(self, duration=60, interval=1):
        """Monitor disk I/O performance"""
        start_time = time.time()
        
        while time.time() - start_time < duration:
            # Get disk I/O statistics
            disk_io = psutil.disk_io_counters()
            
            # Get per-disk statistics
            per_disk_io = psutil.disk_io_counters(perdisk=True)
            
            # Get disk usage for all mount points
            disk_usage = {}
            for partition in psutil.disk_partitions():
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    disk_usage[partition.device] = {
                        'total': usage.total,
                        'used': usage.used,
                        'free': usage.free,
                        'percentage': usage.used / usage.total * 100
                    }
                except PermissionError:
                    continue
            
            io_metrics = {
                'timestamp': time.time(),
                'global_io': {
                    'read_count': disk_io.read_count,
                    'write_count': disk_io.write_count,
                    'read_bytes': disk_io.read_bytes,
                    'write_bytes': disk_io.write_bytes,
                    'read_time': disk_io.read_time,
                    'write_time': disk_io.write_time
                },
                'per_disk_io': per_disk_io,
                'disk_usage': disk_usage
            }
            
            self.io_metrics.append(io_metrics)
            time.sleep(interval)
    
    def analyze_io_bottlenecks(self):
        """Analyze I/O metrics for bottlenecks"""
        if len(self.io_metrics) < 2:
            return {"error": "Need at least 2 I/O measurements"}
        
        first = self.io_metrics[0]
        last = self.io_metrics[-1]
        time_diff = last['timestamp'] - first['timestamp']
        
        # Calculate I/O rates
        read_rate = (last['global_io']['read_bytes'] - first['global_io']['read_bytes']) / time_diff
        write_rate = (last['global_io']['write_bytes'] - first['global_io']['write_bytes']) / time_diff
        iops_read = (last['global_io']['read_count'] - first['global_io']['read_count']) / time_diff
        iops_write = (last['global_io']['write_count'] - first['global_io']['write_count']) / time_diff
        
        # Calculate average I/O latency
        read_latency = 0
        write_latency = 0
        
        if iops_read > 0:
            total_read_time = last['global_io']['read_time'] - first['global_io']['read_time']
            read_latency = total_read_time / (iops_read * time_diff * 1000)  # ms per operation
        
        if iops_write > 0:
            total_write_time = last['global_io']['write_time'] - first['global_io']['write_time']
            write_latency = total_write_time / (iops_write * time_diff * 1000)  # ms per operation
        
        analysis = {
            'io_performance': {
                'read_throughput_mbps': read_rate / (1024 * 1024),
                'write_throughput_mbps': write_rate / (1024 * 1024),
                'read_iops': iops_read,
                'write_iops': iops_write,
                'read_latency_ms': read_latency,
                'write_latency_ms': write_latency
            },
            'bottleneck_indicators': []
        }
        
        # Identify bottlenecks
        if read_latency > 10:  # High read latency
            analysis['bottleneck_indicators'].append({
                'type': 'high_read_latency',
                'severity': 'warning' if read_latency < 50 else 'critical',
                'description': f"High read latency: {read_latency:.1f}ms"
            })
        
        if write_latency > 10:  # High write latency
            analysis['bottleneck_indicators'].append({
                'type': 'high_write_latency', 
                'severity': 'warning' if write_latency < 50 else 'critical',
                'description': f"High write latency: {write_latency:.1f}ms"
            })
        
        # Check disk space
        for device, usage in last['disk_usage'].items():
            if usage['percentage'] > 90:
                analysis['bottleneck_indicators'].append({
                    'type': 'disk_space_critical',
                    'severity': 'critical',
                    'description': f"Disk {device} is {usage['percentage']:.1f}% full"
                })
            elif usage['percentage'] > 80:
                analysis['bottleneck_indicators'].append({
                    'type': 'disk_space_warning',
                    'severity': 'warning', 
                    'description': f"Disk {device} is {usage['percentage']:.1f}% full"
                })
        
        return analysis
    
    def optimize_io_performance(self, analysis):
        """Provide I/O optimization recommendations"""
        recommendations = []
        
        for indicator in analysis['bottleneck_indicators']:
            if 'latency' in indicator['type']:
                recommendations.extend([
                    "Consider using SSD storage for better latency",
                    "Implement I/O request batching and queuing",
                    "Use async I/O operations where possible",
                    "Consider I/O caching strategies",
                    "Optimize file system and mount options"
                ])
            
            elif 'disk_space' in indicator['type']:
                recommendations.extend([
                    "Implement log rotation and archival policies",
                    "Clean up temporary files and caches",
                    "Consider data compression for archival data",
                    "Add disk space monitoring and alerting",
                    "Plan for storage capacity expansion"
                ])
        
        # Amazon-specific recommendations
        amazon_recommendations = self._get_amazon_io_recommendations(analysis)
        recommendations.extend(amazon_recommendations)
        
        return list(set(recommendations))  # Remove duplicates
    
    def _get_amazon_io_recommendations(self, analysis):
        """Get Amazon-specific I/O optimization recommendations"""
        recommendations = []
        
        io_perf = analysis['io_performance']
        
        # EBS optimization recommendations
        if io_perf['read_iops'] > 3000 or io_perf['write_iops'] > 3000:
            recommendations.append("Consider EBS-optimized instances for high IOPS workloads")
            recommendations.append("Use io1/io2 EBS volumes for consistent high IOPS")
        
        if io_perf['read_latency_ms'] > 20 or io_perf['write_latency_ms'] > 20:
            recommendations.append("Consider instance store (NVMe SSD) for ultra-low latency")
            recommendations.append("Enable EBS Multi-Attach for shared high-performance storage")
        
        # S3 optimization recommendations  
        if io_perf['read_throughput_mbps'] > 100:
            recommendations.append("Consider S3 Transfer Acceleration for high throughput")
            recommendations.append("Use S3 multipart upload for large files")
            recommendations.append("Implement S3 request rate optimization (prefix distribution)")
        
        return recommendations

# File system performance testing
class FileSystemBenchmark:
    """Comprehensive file system performance benchmark"""
    
    def __init__(self, test_directory="/tmp/io_benchmark"):
        self.test_directory = Path(test_directory)
        self.test_directory.mkdir(exist_ok=True)
        self.results = {}
    
    def run_sequential_benchmark(self, file_size_mb=100, block_size_kb=64):
        """Run sequential read/write benchmark"""
        file_size = file_size_mb * 1024 * 1024
        block_size = block_size_kb * 1024
        
        test_file = self.test_directory / "sequential_test.dat"
        
        # Sequential write test
        write_start = time.time()
        with open(test_file, 'wb') as f:
            written = 0
            data_block = os.urandom(block_size)
            
            while written < file_size:
                f.write(data_block)
                written += block_size
            
            f.flush()
            os.fsync(f.fileno())
        
        write_time = time.time() - write_start
        write_throughput = file_size / write_time / (1024 * 1024)  # MB/s
        
        # Sequential read test
        read_start = time.time()
        with open(test_file, 'rb') as f:
            while f.read(block_size):
                pass
        
        read_time = time.time() - read_start
        read_throughput = file_size / read_time / (1024 * 1024)  # MB/s
        
        # Cleanup
        test_file.unlink()
        
        self.results['sequential'] = {
            'write_throughput_mbps': write_throughput,
            'read_throughput_mbps': read_throughput,
            'write_time_seconds': write_time,
            'read_time_seconds': read_time
        }
        
        return self.results['sequential']
    
    def run_random_iops_benchmark(self, num_operations=10000, file_size_mb=100):
        """Run random I/O operations benchmark"""
        import random
        
        file_size = file_size_mb * 1024 * 1024
        test_file = self.test_directory / "random_test.dat"
        
        # Create test file
        with open(test_file, 'wb') as f:
            f.write(os.urandom(file_size))
        
        # Random read benchmark
        read_start = time.time()
        with open(test_file, 'rb') as f:
            for _ in range(num_operations):
                position = random.randint(0, file_size - 4096)
                f.seek(position)
                f.read(4096)  # 4KB reads
        
        read_time = time.time() - read_start
        read_iops = num_operations / read_time
        
        # Random write benchmark
        write_start = time.time()
        with open(test_file, 'r+b') as f:
            for _ in range(num_operations):
                position = random.randint(0, file_size - 4096)
                f.seek(position)
                f.write(os.urandom(4096))  # 4KB writes
            
            f.flush()
            os.fsync(f.fileno())
        
        write_time = time.time() - write_start
        write_iops = num_operations / write_time
        
        # Cleanup
        test_file.unlink()
        
        self.results['random'] = {
            'read_iops': read_iops,
            'write_iops': write_iops,
            'read_latency_ms': (read_time / num_operations) * 1000,
            'write_latency_ms': (write_time / num_operations) * 1000
        }
        
        return self.results['random']
    
    def cleanup(self):
        """Clean up test directory"""
        import shutil
        if self.test_directory.exists():
            shutil.rmtree(self.test_directory)
```

This comprehensive performance engineering module covers queueing theory applications, system bottleneck identification for CPU/memory/I/O, and provides Amazon-specific optimization strategies. The mathematical models and practical implementations help identify and resolve performance issues at scale.