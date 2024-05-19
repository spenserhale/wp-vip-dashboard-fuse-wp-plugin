<?php
/**
 * Plugin Name: WP VIP Dashboard Fuse
 * Description: Integrates WordPress VIP Dashboard Features into WordPress Application
 * Version: 1.0.0
 * Requires PHP: 8.2
 * Author: Spenser Hale
 * Author URI: https://www.spenserhale.com/
 * License: GPL v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: sh-wpdf
 * Domain Path: /languages
 *
 * WP VIP Dashboard Fuse Plugin
 * Copyright (C) 2024 Spenser Hale
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Disclaimer: This plugin is not affiliated with, endorsed by, or in any
 * way officially connected to WordPress VIP The name “WordPress VIP” and
 * related trademarks and logos are the property of WordPress VIP.
 * This plugin is independently developed by Spenser Hale and is intended
 * for use with WordPress VIP services by users under their own responsibility.
 */

namespace SH\WVDF;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use function _doing_it_wrong;
use function add_filter;
use function plugin_dir_path;
use function plugin_dir_url;

if ( PHP_VERSION_ID < 80200 ) {
	_doing_it_wrong( __FILE__, 'WP VIP Dashboard Fuse requires PHP 8.2 or higher.', '1.0.0' );

	return;
}

const BEARER_TOKEN_USER_META = 'wp_vip_bearer_token';
const CAPABILITY = 'use_wp_vip_dashboard_fuse';
const ENQUEUE_HANDLE = 'wvdf-asset';
const LOCALIZATION_CONFIG_FILTER = 'wvdf/localization_config';

function enqueue_admin_scripts(): void
{
    $config = apply_filters(LOCALIZATION_CONFIG_FILTER, []);
    if (empty($config)) {
        return;
    }

    $asset_file = plugin_dir_path(__FILE__).'dist/app.asset.php';
    if (! is_file($asset_file)) {
        return;
    }

    $asset = include $asset_file;

    $plugin_dir_url = plugin_dir_url(__FILE__);
    wp_enqueue_script(
        ENQUEUE_HANDLE,
        $plugin_dir_url.'dist/app.js',
        $asset['dependencies'],
        $asset['version']
    );

    wp_localize_script(ENQUEUE_HANDLE, 'WpVipDashboardFuseLocalization', $config);
}
add_filter('admin_enqueue_scripts', '\SH\WVDF\enqueue_admin_scripts');

function register_graphql_route(): void
{
    register_rest_route('wvdf/v1', '/graphql/', [
        'methods'  => 'POST',
        'callback' => static function (WP_REST_Request $request) {
            if ( ! str_contains($request->get_header('content_type'), 'application/json')) {
                return new WP_REST_Response('Invalid content type', 400);
            }

            $token = wp_get_current_user()?->get(BEARER_TOKEN_USER_META);
            if (empty($token)) {
                return new WP_REST_Response('Token is required', 403);
            }

            $response = wp_remote_post('https://api.wpvip.com/graphql', [
                'headers' => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer '.$token,
                    'Origin'        => 'https://dashboard.wpvip.com',
                ],
                'body'    => $request->get_body(),
                'timeout' => 600,
            ]);

            return match(true) {
                $response instanceof WP_Error => new WP_REST_Response($response->get_error_message(), 500),
                default => new WP_REST_Response($response['body'], wp_remote_retrieve_response_code($response)),
            };
        },
        'permission_callback' => static fn () => current_user_can(CAPABILITY),
    ]);
}
add_action('rest_api_init', '\SH\WVDF\register_graphql_route');
