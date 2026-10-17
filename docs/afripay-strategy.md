# AfriPay Market Expansion Strategy

## Executive summary

AfriPay needs to reduce operational risk without introducing a platform that a small team cannot maintain. I would standardize one release process across all six markets while keeping each market's runtime, credentials, logs, and transaction data isolated in-country. The first objective is safe, repeatable deployment and rollback; secrets management and proactive monitoring follow immediately, then capacity preparation and testing for salary-date demand.

The target approach uses immutable container images, GitHub Actions, protected production environments, short-lived cloud credentials, and the same infrastructure pattern in every market. Configuration and capacity can vary by market, but the artifact and controls remain consistent.

## 1. Deployments and rollbacks

### Automating releases across six markets

I would replace SSH-based changes with a single GitHub Actions release workflow backed by infrastructure as code:

1. Build the application once, scan it, and publish an immutable image identified by its digest.
2. Promote that exact digest through test and production rather than rebuilding it for each market.
3. Model Kenya, Tanzania, Lesotho, Ethiopia, Mozambique, and DRC as separate protected environments. Each environment has its own cloud account or workload boundary, deployment role, cluster, secrets, approval rules, and in-country logging destination.
4. Deploy to one low-risk market first as a canary. If its technical and payment-service checks remain healthy, continue market by market. Kenya should not be the first target because it carries the highest load.
5. Use rolling or blue/green container deployments with readiness checks. The pipeline talks to the cloud control plane; engineers no longer SSH to servers.

GitHub Actions is appropriate because the code is already hosted on GitHub and the team is small. Reusable workflows avoid six copies of the same logic. OpenID Connect provides temporary credentials, and every production job requires approval from the relevant market owner. Concurrency controls prevent overlapping releases to the same market.

This also handles unreliable local connectivity better than an engineer's SSH session: a managed runner performs an idempotent API operation, reports progress centrally, and can be retried without repeating unknown server-side commands.

### Rolling back in under five minutes

Every release records the previously active task-definition revision and retains earlier image digests. ECS health checks and a deployment circuit breaker automatically return to the last healthy revision if the new tasks fail. An operator can also run the same workflow in rollback mode, select the affected market, and provide the previous task-definition ARN.

The five-minute objective should be rehearsed, not assumed. A quarterly game day would time detection, approval, rollback, service recovery, and customer-impact verification. Alerts and the release dashboard should link directly to the rollback runbook.

Database changes are the main rollback risk. I would use expand-and-contract migrations: add backward-compatible schema first, deploy code that can work with both versions, and remove old schema only in a later release. Destructive migrations do not run in the application deployment job.

## 2. Secrets management

### Risks of plaintext secrets

Plaintext API keys and database passwords can leak through source control, server backups, support bundles, screenshots, logs, or overly broad file access. A leaked credential can enable fraudulent transactions, unauthorized access to customer data, lateral movement into other systems, and regulatory penalties. Shared static credentials also remove accountability, make rotation disruptive, and often remain valid after staff or vendors leave.

Deleting a secret from the current configuration is not enough because it may remain in Git history and backups.

### Practical remediation

I would use AWS Secrets Manager with a separate KMS key and secret namespace in each market:

- Store no secret values in GitHub, Terraform variables, images, or server configuration files.
- Give each workload identity permission to read only the specific secrets it needs. Humans receive break-glass access through audited roles, not routine direct access.
- Inject secrets when the task starts and keep them out of logs and deployment output.
- Rotate database and API credentials, beginning with any values previously stored in plaintext. Rotation uses overlapping validity where an upstream provider supports it so there is no outage.
- Record reads and administrative changes in CloudTrail and alert on unusual access or failed rotation.
- Use secret scanning in pull requests to block future accidental commits.

Where an external provider cannot rotate automatically, Secrets Manager still owns the value and a scheduled, documented rotation runbook controls the change.

## 3. Monitoring and alerting

I would establish centralized dashboards with strict market boundaries. Application services emit structured logs, traces, and metrics through OpenTelemetry; platform and database metrics come from CloudWatch. Each market gets a synthetic payment-path probe, and alerts route to the on-call service with a runbook, market, severity, and correlation identifier. A public or internal status view helps support teams respond consistently.

Alerts should be based on customer impact and sustained symptoms rather than every infrastructure fluctuation. Paging alerts require immediate action; lower-priority capacity trends create tickets. Logs remain in their country of origin, with only approved aggregate service indicators available to a regional dashboard.

The three primary USSD payment-service metrics are:

1. **End-to-end payment success rate:** the percentage of valid payment attempts that finish successfully, split by market and failure reason. This is the clearest signal that customers can transact and catches application, database, mobile-network, and downstream-provider failures.
2. **p95 end-to-end response latency:** measured from receipt of the USSD request to the final service response. USSD sessions have short timeouts, so rising tail latency causes abandoned sessions even when average latency looks healthy.
3. **USSD journey availability:** the percentage of synthetic login-to-payment journeys completed within the agreed time, per market and mobile network. This detects an outage before social media reports it and validates the full path rather than only an HTTP health endpoint.

Initial service objectives could be 99.95% journey availability and a payment success-rate target agreed with product and operations. Latency thresholds should be set below the actual mobile-network timeout and refined from production baselines. Alerts use short and long burn-rate windows so severe incidents page quickly without creating noise from brief spikes.

## 4. Handling salary-date peak load

### Preparing Kenya

I would first quantify the previous three salary periods: requests per second, concurrent USSD sessions, payment mix, database load, downstream limits, and p95 latency. Capacity planning would include headroom above the observed peak rather than guessing from average traffic.

Before the 25th, Kenya would use scheduled pre-scaling in addition to metric-based autoscaling so capacity is ready before demand arrives. Application tasks remain stateless and scale horizontally across availability zones. The database receives connection pooling, reviewed indexes and slow queries, storage headroom, Multi-AZ resilience, and an instance size proven by testing. Read-only workloads can use replicas, but payment writes continue through the primary.

I would also add bounded queues where processing can safely be asynchronous, idempotency keys to prevent duplicate payments during retries, strict timeouts and circuit breakers for downstream services, and backpressure or fair rate limits instead of allowing total resource exhaustion. Business and mobile-network partners must confirm their own limits; scaling AfriPay alone does not remove an upstream bottleneck.

### Proving readiness before the 25th

Using anonymized traffic shapes, k6 or a similar tool would exercise the complete payment journey in a production-like Kenya environment. The test plan includes:

- a gradual ramp to the forecast peak plus agreed safety margin;
- a sudden spike to verify scheduled and dynamic scaling;
- a multi-hour soak test to reveal connection, memory, and queue buildup;
- downstream latency and failure injection to verify timeouts, idempotency, and circuit breakers;
- loss of a task and an availability zone to confirm traffic continues;
- a deployment and rollback while load is present.

Pass criteria are agreed before testing: no duplicate transactions, the target success rate and p95 latency are met, queues recover, the database stays within safe connection and storage limits, and rollback completes in under five minutes. Results, bottlenecks, and final capacity settings are reviewed with engineering, operations, product, and the Kenya market owner.

## 5. First priority

If I could fix only one problem in the first two weeks, I would implement automated deployments with a tested rollback path.

The team has already experienced a three-hour USSD outage caused by a release, deployments consume a full working day, and there is currently no reliable recovery mechanism. Standardizing immutable releases, approval, health verification, and rollback immediately reduces the most frequent high-impact operational risk and makes every later security or observability change safer to deliver across six markets.

Success after two weeks means one service can be deployed without SSH, the previous version can be restored within five minutes during a witnessed exercise, access is auditable, and the process is documented well enough for another engineer to operate. Plaintext credentials remain an urgent security issue and would be the next workstream, beginning with inventory and rotation planning during the same period without delaying the rollback control.

## Proposed delivery order

- **Weeks 1-2:** establish the immutable release path, protected market environments, automated health verification, and a measured rollback exercise.
- **Weeks 3-4:** move and rotate plaintext credentials, enforce workload identities, enable secret scanning, and remove routine server access.
- **Weeks 5-6:** deploy payment-journey telemetry, service-level objectives, on-call routing, dashboards, and runbooks.
- **Before the next salary period:** complete Kenya capacity tests, pre-scaling, failure exercises, and a go/no-go review.

This order keeps USSD availability central, gives the small team one repeatable operating model, respects in-country data boundaries, and adds controls in increments the team can maintain.
