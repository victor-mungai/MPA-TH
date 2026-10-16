# AWS reference architecture

This directory is an executable design artifact. It demonstrates how the API could run securely and scale on AWS, but the repository automation never creates or changes cloud resources.

The design uses two availability zones, public subnets only for an Application Load Balancer and NAT gateways, private subnets for ECS Fargate tasks, and isolated subnets for PostgreSQL. Tasks use immutable image digests, a read-only root filesystem, dropped Linux capabilities, a dedicated IAM role with no permissions, and a separate least-privilege execution role. Database credentials are supplied from Secrets Manager rather than Terraform values.

Availability and scaling are provided by multiple application tasks, target health checks, rolling deployments, ECS CPU target tracking, one NAT gateway per availability zone, RDS Multi-AZ, automated backups, and storage autoscaling. Encryption, TLS, deletion protection, immutable ECR tags, image scanning, Container Insights, and retained application logs provide defense in depth.

## Validation only

The GitHub workflow runs formatting, initialization without a state backend, configuration validation, and static security scanning. It has read-only repository permissions and receives no AWS credentials.

To validate locally:

```bash
terraform -chdir=infrastructure fmt -check -recursive
terraform -chdir=infrastructure init -backend=false -lockfile=readonly
terraform -chdir=infrastructure validate
```

There is deliberately no backend configuration, environment variable file, plan, or apply command. Placeholder input defaults make validation deterministic and are not deployment values.

For a real deployment, state would live in an encrypted, locked remote backend in a separate bootstrap stack. Changes would require reviewed plans, protected environments, short-lived OIDC credentials, manual approval, policy checks, and environment-specific inputs. Production would also add AWS WAF, Route 53, alerting, restore tests, and database connection pooling based on measured requirements.
