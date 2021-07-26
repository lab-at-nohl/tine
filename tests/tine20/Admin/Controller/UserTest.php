<?php
/**
 * Tine 2.0 - http://www.tine20.org
 *
 * Test class for Admin_Controller_User
 * 
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2008-2021 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schüle <p.schuele@metaways.de>
 */
class Admin_Controller_UserTest extends TestCase
{
    /**
     * set up tests
     */
    protected function setUp(): void
    {
        Tinebase_TransactionManager::getInstance()->unitTestForceSkipRollBack(true);
        parent::setUp();
    }

    public function testAddUserWithAlreadyExistingEmailData()
    {
        $this->_skipWithoutEmailSystemAccountConfig();
        $this->_skipIfLDAPBackend();

        $userToCreate = TestCase::getTestUser([
            'accountLoginName'      => 'phpunitadminjson',
            'accountEmailAddress'   => 'phpunitadminjson@' . TestServer::getPrimaryMailDomain(),
        ]);
        $userToCreate->smtpUser = new Tinebase_Model_EmailUser(array(
            'emailAddress'     => $userToCreate->accountEmailAddress,
        ));
        $pw = Tinebase_Record_Abstract::generateUID(12);
        $user = Admin_Controller_User::getInstance()->create($userToCreate, $pw, $pw);

        // delete user and add again
        $backend = new Tinebase_User_Sql();
        $backend->deleteUserInSqlBackend($user);

        try {
            $user = Admin_Controller_User::getInstance()->create($userToCreate, $pw, $pw);
            self::fail('should throw an exception: "email address already exists". user: ' . print_r($user->toArray(), true));
        } catch (Tinebase_Exception_SystemGeneric $tesg) {
            $translate = Tinebase_Translation::getTranslation('Tinebase');
            self::assertEquals($translate->_('Email account already exists'), $tesg->getMessage());
        }
    }

    public function testAddAccountWithMFAConfigs()
    {
        $user = $this->_createUserWithEmailAccount([
            'mfa_configs' => [[
                Tinebase_Model_MFA_UserConfig::FLD_ID => 'test',
                Tinebase_Model_MFA_UserConfig::FLD_MFA_CONFIG_ID => 'test',
                Tinebase_Model_MFA_UserConfig::FLD_CONFIG_CLASS => Tinebase_Model_MFA_PinUserConfig::class,
                Tinebase_Model_MFA_UserConfig::FLD_CONFIG => [
                    Tinebase_Model_MFA_PinUserConfig::FLD_PIN => ''
                ]
            ]]
        ]);

        $this->assertInstanceOf(Tinebase_Record_RecordSet::class, $user->mfa_configs);
        $this->assertInstanceOf(Tinebase_Model_MFA_UserConfig::class, $user->mfa_configs->getFirstRecord());
    }

    /** this test makes Admin_Frontend_Json_EmailAccountTest::testGetSetSieveRuleForSclever fail
     * something doesnt properly get cleaned up in the email account area
    public function testDeleteRenameLogin()
    {
        Admin_Controller_User::getInstance()->delete([$this->_personas['sclever']->getId()]);
        /** @var Tinebase_Model_FullUser $jmcblack *
        $jmcblack = clone $this->_personas['jmcblack'];
        $jmcblack->accountLoginName = 'sclever';
        Admin_Controller_User::getInstance()->update($jmcblack);
        Admin_Controller_User::getInstance()->setAccountPassword($jmcblack, '1234qweRT!', '1234qweRT!');
        $authResult = Tinebase_Auth::getInstance()->authenticate('sclever', '1234qweRT!');
        $this->assertSame(Tinebase_Auth::SUCCESS, $authResult->getCode(), print_r($authResult->getMessages(), true));
    }*/

    public function testAddAccountWithEmailUserXprops()
    {
        $this->_skipWithoutEmailSystemAccountConfig();

        // create user + check if email user is created
        $user = $this->_createUserWithEmailAccount();
        self::assertTrue(isset($user->xprops()[Tinebase_Model_FullUser::XPROP_EMAIL_USERID_SMTP]),
            'email userid xprop missing: ' . print_r($user->toArray(), true));
        $emailUserBackend = Tinebase_EmailUser::getInstance(Tinebase_Config::SMTP);
        $xpropsUser = clone($user);
        Tinebase_EmailUser_XpropsFacade::setIdFromXprops($user, $xpropsUser);
        $userInBackend = $emailUserBackend->getRawUserById($xpropsUser);
        self::assertEquals($user->accountEmailAddress, $userInBackend['email'], 'email was not added: '
            . print_r($userInBackend, true));
        self::assertEquals($user->xprops()[Tinebase_Model_FullUser::XPROP_EMAIL_USERID_SMTP], $userInBackend['userid']);

        // add alias
        $emailUser = array (
            'emailMailQuota' => 0,
            'emailMailSize' => 0,
            'emailSieveQuota' => 0,
            'emailSieveSize' => 0,
            'emailLastLogin' => '',
            'emailForwardOnly' => false,
            'emailAliases' =>
                array (
                    0 =>
                        array (
                            'email' => 'aliasxprops@' . TestServer::getPrimaryMailDomain(),
                            'dispatch_address' => 1,
                        ),
                ),
            'emailForwards' =>
                array (
                ),
        );
        $user->emailUser = new Tinebase_Model_EmailUser($emailUser);
        $user->imapUser  = new Tinebase_Model_EmailUser($emailUser);
        $user->smtpUser  = new Tinebase_Model_EmailUser($emailUser);
        $user = Admin_Controller_User::getInstance()->update($user);
        // check aliases
        $user = Admin_Controller_User::getInstance()->get($user->getId());
        self::assertTrue(isset($user->smtpUser->emailAliases) && count($user->smtpUser->emailAliases) === 1,
            print_r($user->toArray(), true));
        self::assertEquals('aliasxprops@' . TestServer::getPrimaryMailDomain(),
            $user->smtpUser->emailAliases[0]['email'], print_r($user->smtpUser->toArray(), true));

        // update user (email address) + check if email user is updated
        $newEmail = 'newaddress' . Tinebase_Record_Abstract::generateUID(6)
            . '@' . TestServer::getPrimaryMailDomain();
        $user->accountEmailAddress = $newEmail;
        Admin_Controller_User::getInstance()->update($user);
        $userInBackend = $emailUserBackend->getRawUserById($xpropsUser);
        self::assertEquals($newEmail, $userInBackend['email'], 'email was not updated: '
            . print_r($userInBackend, true));

        // delete user + check if email user is deleted
        Admin_Controller_User::getInstance()->delete([$user->getId()]);
        $userInBackend = $emailUserBackend->getRawUserById($xpropsUser);
        self::assertFalse($userInBackend, 'email user should be deleted: '
            . print_r($userInBackend, true));
    }

    public function testAddUserAdbContainer()
    {
        $container = $this->_getTestContainer(Addressbook_Config::APP_NAME, Addressbook_Model_Contact::class, true);

        $userToCreate = TestCase::getTestUser();
        $userToCreate->container_id = $container->getId();
        $pw = Tinebase_Record_Abstract::generateUID(12);

        $this->_usernamesToDelete[] = $userToCreate->accountLoginName;
        $user = Admin_Controller_User::getInstance()->create($userToCreate, $pw, $pw);

        static::assertSame($container->getId(), $user->container_id);
        static::assertSame($container->getId(),
            Addressbook_Controller_Contact::getInstance()->get($user->contact_id)->container_id);
    }

    public function testUpdateUserAdbContainer()
    {
        $container = $this->_getTestContainer(Addressbook_Config::APP_NAME, Addressbook_Model_Contact::class, true);

        $userToCreate = TestCase::getTestUser();
        $userToCreate->container_id = $container->getId();
        $pw = Tinebase_Record_Abstract::generateUID(12);

        $this->_usernamesToDelete[] = $userToCreate->accountLoginName;
        $user = Admin_Controller_User::getInstance()->create($userToCreate, $pw, $pw);

        static::assertSame($container->getId(), $user->container_id);
        static::assertSame($container->getId(),
            Addressbook_Controller_Contact::getInstance()->get($user->contact_id)->container_id);

        $updateContainer = $this->_getTestContainer(Addressbook_Config::APP_NAME, Addressbook_Model_Contact::class,
            true, __METHOD__);

        $user->container_id = $updateContainer->getId();

        $user = Admin_Controller_User::getInstance()->update($user);

        static::assertSame($updateContainer->getId(), $user->container_id);
        static::assertSame($updateContainer->getId(),
            Addressbook_Controller_Contact::getInstance()->get($user->contact_id)->container_id);
    }

    public function testUpdateUserWithEmailButNoPassword()
    {
        $this->_skipWithoutEmailSystemAccountConfig();
        $pw = 'aw%6N64ZR2Pev';

        $userToCreate = TestCase::getTestUser();
        $email = $userToCreate->accountEmailAddress;
        unset($userToCreate->accountEmailAddress);
        $user = Admin_Controller_User::getInstance()->create($userToCreate, $pw, $pw);
        $this->_usernamesToDelete[] = $userToCreate->accountLoginName;

        $user->accountEmailAddress = $email;
        try {
            Admin_Controller_User::getInstance()->update($user);
            self::fail('exception expected because no pw given for user email account');
        } catch (Tinebase_Exception_SystemGeneric $tesg) {
            $translate = Tinebase_Translation::getTranslation('Admin');
            self::assertEquals($translate->_('Password is needed for system account creation'), $tesg->getMessage());
        }
    }

    public function testAddUserWithExistingMail()
    {
        $this->_skipWithoutEmailSystemAccountConfig();

        $pw = Tinebase_Record_Abstract::generateUID(10);
        $userToCreate = TestCase::getTestUser();
        $userToCreate->accountEmailAddress = Tinebase_Core::getUser()->accountEmailAddress;
        try {
            $user = Admin_Controller_User::getInstance()->create($userToCreate, $pw, $pw);
            self::fail('should throw an exception: "email address already exists". user: ' . print_r($user->toArray(), true));
        } catch (Tinebase_Exception_SystemGeneric $tesg) {
            $translate = Tinebase_Translation::getTranslation('Tinebase');
            self::assertEquals($translate->_('Email account already exists'), $tesg->getMessage());
        }
    }

    public function testUpdateUserRemoveMail()
    {
        $this->_skipWithoutEmailSystemAccountConfig();

        $user = $this->_createUserWithEmailAccount();
        $user->accountEmailAddress = '';
        $updatedUser = Admin_Controller_User::getInstance()->update($user);

        self::assertEmpty($updatedUser->xprops()[Tinebase_Model_FullUser::XPROP_EMAIL_USERID_SMTP],
            'smtp user id still set: ' . print_r($updatedUser->toArray(), true));
        self::assertEmpty($updatedUser->xprops()[Tinebase_Model_FullUser::XPROP_EMAIL_USERID_IMAP],
            'imap user id still set ' . print_r($updatedUser->toArray(), true));
    }
}
