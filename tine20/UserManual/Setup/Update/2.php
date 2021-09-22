<?php

/**
 * Tine 2.0
 *
 * @package     UserManual
 * @subpackage  Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2020 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Paul Mehrer <p.mehrer@metaways.de>
 */
class UserManual_Setup_Update_2 extends Setup_Update_Abstract
{
    const RELEASE002_UPDATE001 = __CLASS__ . '::update001';


    static protected $_allUpdates = [
        self::PRIO_NORMAL_APP_UPDATE        => [
            self::RELEASE002_UPDATE001          => [
                self::CLASS_CONST                   => self::class,
                self::FUNCTION_CONST                => 'update001',
            ],
        ],
    ];

    public function update001()
    {
        Setup_SchemaTool::updateSchema([UserManual_Model_ManualPage::class]);
        $this->addApplicationUpdate('UserManual', '2.1', self::RELEASE002_UPDATE001);
    }
}
