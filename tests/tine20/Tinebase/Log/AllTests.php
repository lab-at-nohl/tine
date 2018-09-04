<?php
/**
 * Tine 2.0 - http://www.tine20.org
 * 
 * @package     Tinebase
 * @subpackage  Record
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */

/**
 * Test helper
 */
require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Tinebase_Log_AllTests
{
    public static function main() 
    {
        PHPUnit_TextUI_TestRunner::run(self::suite());
    }
    
    public static function suite() 
    {
        $suite = new PHPUnit_Framework_TestSuite('Tine 2.0 Tinebase All Log Tests');
        $suite->addTestSuite('Tinebase_Log_Filter_FilterTest');
        $suite->addTestSuite('Tinebase_Log_FormatterTest');
        $suite->addTestSuite('Tinebase_Log_Formatter_JsonTest');
        return $suite;
    }
}
