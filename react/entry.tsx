import { render } from "@wordpress/element";
import DeploymentMenuItem from "./DeploymentMenuItem";
import { Config } from "./Definitions";

document.addEventListener('DOMContentLoaded', () => {
  const adminBar = document.getElementById('wp-admin-bar-root-default');
  if (!adminBar) {
    return;
  }

  // @ts-ignore
  if(!window.WpVipDashboardFuseLocalization) {
    return;
  }
  // @ts-ignore
  const config = window.WpVipDashboardFuseLocalization as Config;
  if (!config.appId || !config.envId) {
    return;
  }

  // add a new menu item to the admin bar
  const menuItem = document.createElement('li');
  menuItem.id = 'wp-admin-bar-wp-vip-deployment';
  menuItem.className = 'menupop';
  adminBar.appendChild(menuItem);

  render(<DeploymentMenuItem config={config}/>, menuItem);
});
