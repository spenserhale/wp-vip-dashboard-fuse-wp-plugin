# WordPress VIP Dashboard Fuse Plugin

WordPress VIP Dashboard Fuse Plugin integrates the WordPress VIP Dashboard within the WordPress Application.

<!-- Installation -->
## Installation

   ```sh
   composer require spenserhale/wp-vip-dashboard-fuse-wp-plugin
   ```

### Configuration Filters

The plugin is in early development and has no user interface. You must provide the configuration through filters.

#### localization_config

For Javascript features you must provide the `appId` and `envId` to the localization config. You can use the `wvdf/localization_config` filter to provide the configuration.

Example
```php
add_filter('wvdf/localization_config', static fn() => current_user_can('use_wp_vip_dashboard_fuse') ? [
    'appId' => (int) env('WPVIP_APP_ID'),
    'envId' => (int) env('WPVIP_ENV_ID'),
] : []);
```

#### get_user_metadata

To provide the `wp_vip_bearer_token` to the WordPress VIP Dashboard, you can use the `get_user_metadata` filter or add the token to the user meta.

Example
```php
add_filter('get_user_metadata', static function($value, $object_id, $meta_key) {
    return $meta_key === 'wp_vip_bearer_token' ? env('WPVIP_BEARER_TOKEN') : $value;
}, 10, 3);
```

## License
The WordPress VIP Dashboard Fuse Plugin is open-sourced software licensed under the [GNU General Public License v3.0 or later](https://spdx.org/licenses/GPL-3.0-or-later.html).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
