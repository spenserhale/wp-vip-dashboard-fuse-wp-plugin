
export interface Config {
  appId: string;
  envId: string;
}


/**
 * Full GraphQL query and interfaces for getAppDeployments
 */
const GetAppDeploymentsQuery = `
query GetAppDeployments($id: Int!, $envId: Int, $first: Int, $nextCursor: String, $permissions: [String] = []) {
app(id: $id) {
    id
    environments(id: $envId) {
      id
      uniqueLabel
      permissions(permissions: $permissions) {
        permission
        isAllowed
        __typename
      }
      deployments(first: $first, nextCursor: $nextCursor) {
        nextCursor
        total
        nodes {
          id
          branch
          repo
          deployment_status
          deployment_triggered_at
          deployment_finished_at
          commit_sha
          commit_author
          commit_time
          commit_description
          createdAt
          cancelledAt
          isLatest
          inProgress
          isAvailableForRollback
          isError
          build {
            id
            start_date
            finish_date
            __typename
          }
          steps {
            step
            status
            inProgress
            isError
            startDate
            finishDate
            __typename
          }
          initiatedBy {
            id
            displayName
            emailAddress
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`;

interface Deployment {
  id: string;
  branch: string;
  repo: string;
  deployment_status: string;
  deployment_triggered_at: string;
  deployment_finished_at: string;
  commit_sha: string;
  commit_author: string;
  commit_time: string;
  commit_description: string;
  createdAt: string;
  cancelledAt: string;
  isLatest: boolean;
  inProgress: boolean;
  isAvailableForRollback: boolean;
  isError: boolean;
  build: {
    id: string;
    start_date: string;
    finish_date: string;
  };
  steps: DeploymentStep[];
  initiatedBy: {
    id: string;
    displayName: string;
    emailAddress: string;
  };
}

interface DeploymentStep {
  step: "PREPARE" | "BUILD" | "DEPLOYMENT";
  status: string;
  inProgress: boolean;
  isError: boolean;
  startDate: string;
  finishDate: string;
}

