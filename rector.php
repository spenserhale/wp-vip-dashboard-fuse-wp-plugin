<?php

declare(strict_types=1);

use Rector\CodeQuality\Rector\Class_\InlineConstructorDefaultToPropertyRector;
use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Core\ValueObject\PhpVersion;
use Rector\TypeDeclaration\Rector\Property\TypedPropertyFromStrictConstructorRector;
use Rector\Set\ValueObject\SetList;
use Rector\Set\ValueObject\DowngradeLevelSetList;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        __DIR__ . '/src',
    ]);

	$rectorConfig->rule(TypedPropertyFromStrictConstructorRector::class);
    $rectorConfig->rule(InlineConstructorDefaultToPropertyRector::class);

    // define sets of rules
	$rectorConfig->sets([
		DowngradeLevelSetList::DOWN_TO_PHP_82,
		SetList::CODE_QUALITY
	]);
};
