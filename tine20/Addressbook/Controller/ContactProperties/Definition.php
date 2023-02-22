<?php declare(strict_types=1);

/**
 * ContactProperties Definition controller for Addressbook application
 *
 * @package     Addressbook
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Paul Mehrer <p.mehrer@metaways.de>
 * @copyright   Copyright (c) 2023 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */


/**
 * ContactProperties Address controller class for Addressbook application
 *
 * @package     Sales
 * @subpackage  Controller
 */
class Addressbook_Controller_ContactProperties_Definition extends Tinebase_Controller_Record_Abstract
{
    use Tinebase_Controller_SingletonTrait;

    /**
     * the constructor
     *
     * don't use the constructor. use the singleton
     */
    protected function __construct()
    {
        $this->_applicationName = Addressbook_Config::APP_NAME;
        $this->_backend = new Tinebase_Backend_Sql([
            Tinebase_Backend_Sql_Abstract::MODEL_NAME => Addressbook_Model_ContactProperties_Definition::class,
            Tinebase_Backend_Sql_Abstract::TABLE_NAME => Addressbook_Model_ContactProperties_Definition::TABLE_NAME,
            Tinebase_Backend_Sql_Abstract::MODLOG_ACTIVE => true,
        ]);
        $this->_modelName = Addressbook_Model_ContactProperties_Definition::class;
        $this->_purgeRecords = false;
    }

    public function checkFilterACL(Tinebase_Model_Filter_FilterGroup $_filter, $_action = self::ACTION_GET)
    {
        if (!$this->_doContainerACLChecks || self::ACTION_GET === $_action) {
            return;
        }
        throw new Tinebase_Exception_AccessDenied('filter actions other than get are not allowed');
    }

    protected function _checkGrant($_record, $_action, $_throw = TRUE, $_errorMessage = 'No Permission.', $_oldRecord = NULL)
    {
        if (!$this->_doContainerACLChecks || self::ACTION_GET === $_action) {
            return true;
        }
        if (! is_object(Tinebase_Core::getUser())) {
            throw new Tinebase_Exception_AccessDenied('User object required to check grants');
        }
        if ($_record->{Addressbook_Model_ContactProperties_Definition::FLD_IS_SYSTEM} ||
                ($_oldRecord && $_oldRecord->{Addressbook_Model_ContactProperties_Definition::FLD_IS_SYSTEM}) ||
                !Tinebase_Core::getUser()->hasRight(Addressbook_Config::APP_NAME, Tinebase_Model_Grants::GRANT_ADMIN)) {
            if ($_throw) {
                throw new Tinebase_Exception_AccessDenied($_errorMessage);
            }
            return false;
        }
        return true;
    }

    protected function _inspectAfterSetRelatedDataCreate($createdRecord, $record)
    {
        parent::_inspectAfterSetRelatedDataCreate($createdRecord, $record);

        if (!$createdRecord->{Addressbook_Model_ContactProperties_Definition::FLD_IS_SYSTEM}) {
            Tinebase_TransactionManager::getInstance()->registerAfterCommitCallback(
                [$createdRecord, 'applyToContactModel'], []);
        }
    }

    protected function _inspectAfterSetRelatedDataUpdate($updatedRecord, $record, $currentRecord)
    {
        parent::_inspectAfterSetRelatedDataUpdate($updatedRecord, $record, $currentRecord);

        if (!$updatedRecord->{Addressbook_Model_ContactProperties_Definition::FLD_IS_SYSTEM}) {
            Tinebase_TransactionManager::getInstance()->registerAfterCommitCallback(
                [$updatedRecord, 'applyToContactModel'], []);
        }
    }

    protected function _inspectDelete(array $_ids)
    {
        $_ids = parent::_inspectDelete($_ids);
        return $this->getMultiple($_ids)->filter(Addressbook_Model_ContactProperties_Definition::FLD_IS_SYSTEM, false)
            ->getArrayOfIds();
    }

    protected function _inspectAfterDelete(Tinebase_Record_Interface $record)
    {
        parent::_inspectAfterDelete($record);

        Tinebase_TransactionManager::getInstance()->registerAfterCommitCallback(
            [$record, 'removeFromContactModel'], []);
    }
}