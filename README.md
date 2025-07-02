[![Build and Deploy lumiere Lambdas](https://github.com/lidia-freitas/lumiere-auth/actions/workflows/pipeline.yaml/badge.svg)](https://github.com/lidia-freitas/lumiere-auth/actions/workflows/pipeline.yaml)

# lumiere Auth

This project is a lightweight TypeScript monorepo for independently deployable AWS Lambda functions with shared libraries.

It is fully automated using GitHub Actions for packaging and updating Lambda functions directly via AWS CLI.

## 📁 Project Structure

```
.
├── apps/
│   ├── sign-in/          # Lambda function for sign-in
│   └── sign-up/          # Lambda function for sign-up
├── libs/
│   └── shared/           # Shared logic used across functions
├── package.json          # Root config with npm workspaces
├── tsconfig.json         # Shared TypeScript config
├── pipeline.yaml         # GitHub Actions workflow for CI/CD
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v8+)
- (Optional) AWS SAM CLI — for local API simulation and testing
  - Install guide: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

### Install and Build

```bash
npm install
npm run build
```

This installs dependencies and builds all workspaces.

### Run Unit Tests

```bash
npm test
```

Each Lambda's unit tests will be executed independently in parallel.

## 🧪 Local Development

You can locally build and test each function individually:

```bash
   cd apps/sign-in
   npm install
   npm run build
   npm test
```

Alternatively, for API simulation and full integration testing, you can use the AWS SAM CLI:

```bash
   sam build
   sam local start-api
```

> Changes to your Lambda source code require re-running `sam build`, but you don't need to restart the 
`sam local start-api` process.

## 📦 Contribution and Deployment Workflow

Direct pushes to the `main` branch are **not allowed**. All changes must be proposed via **Pull Requests**.

When a Pull Request is opened targeting the `main` branch:
- Only the `build` job will run to validate the code in the following steps:
  - Dependencies are installed
  - The project is built
  - Unit tests are run

When a Pull Request is merged into the `main` branch:
- The `build`, `package`, and `deploy` jobs will run to ensure that:
  - Dependencies are installed
  - The project is built
  - Unit tests are run
  - Lambda artifacts are packaged
  - Lambda functions are updated directly via AWS CLI

Each Lambda function is packaged into a `.zip` artifact and is updated directly with the new zipped code.

## 🔗 Related Repositories

Infrastructure (such as Lambda creation, Api Gateway, and permissions) is managed separately by the [`lumiere-iac`](https://github.com/lidia-freitas/lumiere-iac) repository using Terraform.

- [lumiere Infrastructure as Code (IaC)](https://github.com/lidia-freitas/lumiere-iac)

---

Built with ❤️ for lumiere
