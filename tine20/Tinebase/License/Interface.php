<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2015 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schüle <p.schuele@metaways.de>
 * 
 */

/**
 * Tine 2.0 License Interface
 *
 * @package     Tinebase
 */
interface Tinebase_License_Interface
{
    public function setLicenseFile($licenseFile);
    public function getLicenseExpiredSince();
    public function getLicenseExpireEstimate();
    public function isValid();
    public function isLicenseAvailable();
    public function getMaxUsers();
    public function getLicenseType();
    public function checkUserLimit($user = null);
    public function getStatus();
}
