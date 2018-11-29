<?php
/**
 * Tine 2.0 - http://www.tine20.org
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2018 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Christian Feitl<c.feitl@metaways.de>
 */

/**
 * Test helper
 */
require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Admin_Import_UserTest extends TestCase
{
    /**
     * @var Tinebase_Model_Container
     */
    protected $_importContainer = null;

    protected function tearDown()
    {
        parent::tearDown();
    }

    public function testImportDemoData()
    {
        $this->markTestSkipped('it imports users with domain harmonie.de and schloss.de, those domains cause issues');
        //Emails domainpart harmonie.de is not in the list of allowed domains! example.org

        if (!extension_loaded('yaml')) {
            $this->markTestSkipped('Yaml are not install');
        }
        $this->_importContainer = $this->_getTestContainer('Admin', 'Tinebase_Model_FullUser');
        $importer = new Tinebase_Setup_DemoData_ImportSet('Admin', [
            'container_id' => $this->_importContainer->getId(),
            'files' => array('Admin.yml')
        ]);
        $importer->importDemodata();

        $users = array('s.rattle', 's.fruehauf', 't.bar', 'j.baum', 'j.metzger', 'e.eichmann', 'm.schreiber');
        $count = 0;
        foreach ($users as $user) {
            if (Admin_Controller_User::getInstance()->searchFullUsers($user)->count() > 0) {
                $count++;
            }
        }
        self::assertEquals(7, $count);
    }
}