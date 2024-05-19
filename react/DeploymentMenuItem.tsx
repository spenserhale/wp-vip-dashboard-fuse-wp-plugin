import React, {useEffect, useState} from 'react';
import apiFetch from '@wordpress/api-fetch';
import {Config} from "./Definitions";

/**
 * Optimized objects for the API response
 */
interface Deployment {
  inProgress: boolean;
  steps: DeploymentStep[];
}

interface DeploymentStep {
  step: "PREPARE" | "BUILD" | "DEPLOYMENT";
  inProgress: boolean;
  startDate: string;
  finishDate: string;
}

const fiveMinutes = 300000;
const oneMinute = 60000;

function getAppDeployment(config: Config) {
  return {
    path: '/wvdf/v1/graphql/',
    method: 'POST',
    data: {
      operationName: 'GetAppDeployments',
      query: `
    query GetAppDeployments($appId: Int!, $envId: Int, $first: Int) {
      app(id: $appId) {
        environments(id: $envId) {
          deployments(first: $first) {
            nodes {
              inProgress
              steps {
                step
                status
                inProgress
                startDate
                finishDate
              }
            }
          }
        }
      }
    }
  `,
      variables: {
        first: 1,
        appId: parseInt(config.appId),
        envId: parseInt(config.envId),
      }
    }
  }
}

const stepDescription = (step: DeploymentStep) => {
  switch (step.step) {
    case "PREPARE":
      return step.inProgress ? "Preparing" : "Prepared";
    case "BUILD":
      return step.inProgress ? "Building" : "Built";
    case "DEPLOYMENT":
      return step.inProgress ? "Deploying" : "Deployed";
    default:
      return "Unknown";
  }
}

const humanTimeDiff = (date: string) => {
  const diff = Date.now() - Date.parse(date);
  const minutes = Math.floor(diff / oneMinute);

  if (minutes < 1) {
    return "less than a minute ago";
  } else if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
};

const DeploymentMenuItem = ({ config }: { config: Config }) => {
  const [pollInterval, setPollInterval] = useState(fiveMinutes);
  const [deployment, setDeployment] = useState<Deployment | null>(null);

  const doFetch = () => {
    apiFetch(getAppDeployment(config))
      .then((value: unknown) => {
        const json = typeof value === 'string' ? JSON.parse(value) : value;
        const deployment = (json?.data?.app?.environments?.[0]?.deployments?.nodes?.[0]) as Deployment || null;
        setDeployment(deployment);
        setPollInterval(deployment?.inProgress ? oneMinute : fiveMinutes);
      })
      .catch(console.error);
  }

  useEffect(doFetch, []);

  useEffect(() => {
    const timeoutId = setTimeout(doFetch, pollInterval);
    return () => clearTimeout(timeoutId);
  }, [pollInterval]);

  if (!deployment) {
    return null;
  }

  return (<>
    <div className="ab-item ab-empty-item" aria-haspopup="true">
      <span className={"ab-icon dashicons " + (deployment?.inProgress ? "dashicons-update" : "dashicons-editor-code")}></span>
      {deployment?.inProgress ? humanTimeDiff(deployment.steps[0].startDate) : humanTimeDiff(deployment.steps[2].finishDate)}
    </div>
    <div className="ab-sub-wrapper">
      <ul id="wp-admin-bar-wp-vip-deployments-default" className="ab-submenu">
        {deployment?.steps && deployment.steps.map((step) => (
          <li id={"wp-admin-bar-wp-vip-deployments-" + step.step.toLowerCase()} key={step.step}>
              <a className="ab-item">
                {stepDescription(step)} {step.inProgress ? humanTimeDiff(step.startDate) : humanTimeDiff(step.finishDate)}
              </a>
          </li>
        ))}
      </ul>
    </div>
  </>);
}

export default DeploymentMenuItem;
