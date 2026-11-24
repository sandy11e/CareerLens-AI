# CareerLens-AI: AWS Free Tier deployment

This guide sets up static frontend deployment from the `production` branch using GitHub Actions and AWS S3. It intentionally uses GitHub OIDC instead of long-lived AWS access keys.

## Architecture (AWS migration target)

- Frontend: React/Vite assets in the existing S3 bucket only after its configuration is verified; keep the bucket private and serve it through CloudFront with Origin Access Control (OAC).
- API: API Gateway HTTP API -> FastAPI Lambda through Mangum. The deployed API Gateway and Lambda targets are not verified in this guide.
- Resume files: private S3 objects; MongoDB Atlas stores owner-scoped metadata and extracted text.
- Evaluations: authenticated API -> SQS -> worker Lambda -> MongoDB Atlas/S3. Queue, DLQ, worker, and event-source mapping require AWS verification/approval.
- CI/CD: GitHub OIDC; CI remains separate from manually dispatched, protected-environment deployment workflows.

Repository configuration is not evidence that a named AWS resource exists. No AWS deployment or resource inventory is claimed here.
## AWS account and cost guardrails

Review the current AWS account plan, service eligibility, and pricing before creating resources; no free-tier or no-cost assumption is made here.

Do not create NAT Gateways, load balancers, EC2 instances, ECS services, paid support plans, or a Route 53 hosted zone for this first milestone. Set an AWS Budget / billing alerts before deploying. S3 requests, storage, and data transfer have limits and can incur charges on a paid plan or after upgrading/exceeding allowances. A public S3 website endpoint serves HTTP, not HTTPS. CloudFront can add HTTPS but must be reviewed against the account's current Free Tier allowance and usage.

## 1. Frontend hosting security

Use a private S3 bucket as a CloudFront origin with Origin Access Control (OAC). Keep S3 Block Public Access enabled and do not add a public `s3:GetObject` bucket policy. Do not use the public S3 website endpoint for production; it requires public bucket access and only serves HTTP.

Configure CloudFront with HTTPS, the S3 REST origin, `index.html` as the default root object, and SPA fallback for client routes. A custom domain requires an ACM certificate in `us-east-1`; no distribution, domain, certificate, or bucket configuration is verified here. Creating or changing these resources requires separate approval.

The frontend deployment workflow should target the private origin bucket and invalidate only an explicitly configured CloudFront distribution after an approved deployment. Required distribution identifiers must come from verified repository configuration; do not invent them.
## 2. GitHub OIDC and deployment variables

The frontend and backend deployment workflows are manually dispatched from the `production` branch through the protected `production` GitHub environment. Require reviewers for that environment. Restrict AWS OIDC trust to this repository and `repo:OWNER/REPO:environment:production`, substituting only verified account and repository values.

Configure these GitHub Actions variables only after verifying each value:

| Variable | Used by | Purpose |
|---|---|---|
| `AWS_ROLE_TO_ASSUME` | Frontend and backend deploy | OIDC role ARN |
| `AWS_REGION` | Frontend and backend deploy | Approved deployment region |
| `AWS_S3_BUCKET` | Frontend deploy | Private CloudFront origin bucket |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Frontend deploy | Verified distribution to invalidate |
| `VITE_API_BASE_URL` | Frontend build/deploy | HTTPS API Gateway base URL without `/api` suffix |
| `LAMBDA_FUNCTION_NAME` | Backend deploy | Approved existing API Lambda function (`main.handler`) |
| `WORKER_LAMBDA_FUNCTION_NAME` | Backend deploy | Approved existing worker Lambda function (`worker.handler`) |
| `LAMBDA_ARTIFACT_BUCKET` | Backend deploy | Private deployment artifact bucket |

Runtime credentials such as MongoDB and Groq values belong in approved Lambda secret configuration, never GitHub build variables or Vite configuration. The backend workflow updates code only. Runtime environment, execution role, API Gateway, SQS, worker, and event-source mapping need separate verified configuration.

## 3. Deploy workflow

CI builds and runs its configured backend/frontend checks without deploying. AWS workflows are `workflow_dispatch` only, restricted to `production`, and use the production environment gate. The frontend workflow syncs to the private origin and waits for CloudFront invalidation; its OIDC role needs narrowly scoped S3 object/list and CloudFront invalidation permissions. The backend workflow checks the configured Lambda runtime/handler and updates only the explicitly configured function using a ZIP stored in the artifact bucket.

Before dispatching either workflow, verify all variable values, OIDC trust/policies, environment reviewers, and target AWS resources. No deployment is claimed or performed by this guide.

## Current backend and production readiness

The repository now contains FastAPI/Mangum compatibility, lazy MongoDB persistence, a private-S3 resume service, and implementation work for asynchronous evaluations and Lambda ZIP deployment. These are repository changes only; Python validation is currently blocked by the unavailable Python 3.12 interpreter, and AWS integration remains unverified.

Before production traffic, verify the existing API Gateway HTTP API and Lambda target, runtime/handler configuration, Lambda execution role, S3 bucket privacy/public-access block/encryption, SQS queue/DLQ and worker event source mapping, MongoDB Atlas connectivity, and GitHub OIDC trust/policies. Use the application environment variables and GitHub repository variables documented in `implementation.md` and `AWS_ARCHITECTURE.md`; never put runtime secrets in Vite variables or the frontend bundle.

Do not claim deployment success until live frontend and backend health checks and upload/evaluation flows are actually verified. No AWS resources were created or modified while preparing this guide.
## Rollback

S3 sync with `--delete` replaces the current site contents. For safer releases, enable S3 Versioning before production use and retain previous build artifacts in GitHub Actions or a separate release prefix. To roll back, re-upload the previous known-good build.
