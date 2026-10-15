# Image publishing configuration

The publishing workflow validates the application, builds and scans the runtime image, and pushes an immutable commit-SHA tag to Amazon ECR. Publishing is skipped safely until its repository variables are configured.

## Required GitHub repository variables

Configure these under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Example | Purpose |
| --- | --- | --- |
| `AWS_ACCOUNT_ID` | `123456789012` | Restricts authentication to the expected AWS account |
| `AWS_REGION` | `af-south-1` | Region containing the ECR repository |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-ecr-publisher` | Role assumed through GitHub OIDC |
| `ECR_REPOSITORY` | `mpa-devops-case-study` | Existing private ECR repository name |

No AWS access keys are stored in GitHub.

## OIDC trust

Create the GitHub OIDC identity provider in AWS and restrict the publishing role's trust policy to this repository and the `main` branch. The audience must be `sts.amazonaws.com`. Use the exact `sub` claim issued for the repository; newer GitHub organizations can include organization and repository IDs in that claim.

The role session is also restricted to the configured AWS account by the workflow.

## ECR permissions

Grant the publishing role only these repository operations:

- `ecr:BatchCheckLayerAvailability`
- `ecr:CompleteLayerUpload`
- `ecr:DescribeImages`
- `ecr:InitiateLayerUpload`
- `ecr:PutImage`
- `ecr:UploadLayerPart`

Scope those operations to the single ECR repository ARN. The role also needs `ecr:GetAuthorizationToken`; AWS requires that action to use `Resource: "*"`, so keep it in a separate policy statement with no other actions.

Enable immutable ECR tags and registry image scanning so a commit-SHA tag cannot be replaced after publication.
