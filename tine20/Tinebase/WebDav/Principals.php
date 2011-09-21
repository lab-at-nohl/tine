<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  WebDav
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2011-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * 
 */

/**
 * class to handle webdav principals
 * 
 * @package     Tinebase
 * @subpackage  WebDav
 */
class Tinebase_WebDav_Principals implements Sabre_DAVACL_IPrincipalBackend
{
    /**
     * (non-PHPdoc)
     * @see Sabre_DAVACL_IPrincipalBackend::getPrincipalsByPrefix()
     */
    public function getPrincipalsByPrefix($prefixPath) 
    {
        $principals = array();
        
        $principals[] = array(
            'uri'                                   => 'principals/users/' . Tinebase_Core::getUser()->contact_id,
            '{http://sabredav.org/ns}email-address' => Tinebase_Core::getUser()->accountEmailAddress,
            '{DAV:}displayname'                     => Tinebase_Core::getUser()->accountDisplayName
        );

        return $principals;
    }
    
    /**
     * (non-PHPdoc)
     * @see Sabre_DAVACL_IPrincipalBackend::getPrincipalByPath()
     */
    public function getPrincipalByPath($path) 
    {
        return array(
            'uri'                                   => 'principals/users/' . Tinebase_Core::getUser()->contact_id,
            '{http://sabredav.org/ns}email-address' => Tinebase_Core::getUser()->accountEmailAddress,
            '{DAV:}displayname'                     => Tinebase_Core::getUser()->accountDisplayName
        );
    }
    
    /**
     * (non-PHPdoc)
     * @see Sabre_DAVACL_IPrincipalBackend::getGroupMemberSet()
     */
    public function getGroupMemberSet($principal) 
    {
        $result = array();
        
        return $result;
    }
    
    /**
     * (non-PHPdoc)
     * @see Sabre_DAVACL_IPrincipalBackend::getGroupMembership()
     */
    public function getGroupMembership($principal) 
    {
        $result = array();
        
        return $result;
    }
    
    public function setGroupMemberSet($principal, array $members) 
    {
        // do nothing
    }
}
