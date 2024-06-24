/**
 * Tine 2.0
 * 
 * @package     Voipmanager
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Thomas Wadewitz <t.wadewitz@metaways.de>
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.namespace('Tine.Voipmanager');

/**
 * SipPeers grid panel
 */
Tine.Voipmanager.AsteriskSipPeerGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    // model generics
    recordClass: Tine.Voipmanager.Model.AsteriskSipPeer,
    evalGrants: false,
    
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'ASC'},
    gridConfig: {
        autoExpandColumn: 'callerid'
    },
    
    initComponent: function() {
        this.recordProxy = Tine.Voipmanager.AsteriskSipPeerBackend;
        this.gridConfig.columns = this.getColumns();
        this.actionToolbarItems = this.getToolbarItems();
        Tine.Voipmanager.AsteriskSipPeerGridPanel.superclass.initComponent.call(this);
    },

    /**
     * returns cm
     * @private
     * 
     */
    getColumns: function(){
        const columns = [
            { id: 'id', header: this.app.i18n._('Id'), width: 30, hidden: true },
            { id: 'name', header: this.app.i18n._('name'), width: 50, sortable: true },
            { id: 'accountcode', header: this.app.i18n._('account code'), width: 30, hidden: true },
            { id: 'amaflags', header: this.app.i18n._('ama flags'), width: 30, hidden: true },
            { id: 'callgroup', header: this.app.i18n._('call group'), width: 30, hidden: true },
            { id: 'callerid', header: this.app.i18n._('caller id'), width: 80, sortable: true },
            { id: 'canreinvite', header: this.app.i18n._('can reinvite'), width: 30, hidden: true },
            { id: 'context', header: this.app.i18n._('context'), width: 50, sortable: false },
            { id: 'defaultip', header: this.app.i18n._('default ip'), width: 30, hidden: true },
            { id: 'dtmfmode', header: this.app.i18n._('dtmf mode'), width: 30, hidden: true },
            { id: 'fromuser', header: this.app.i18n._('from user'), width: 30, hidden: true },
            { id: 'fromdomain', header: this.app.i18n._('from domain'), width: 30, hidden: true },
            { id: 'fullcontact', header: this.app.i18n._('full contact'), width: 200, hidden: true },
            { id: 'host', header: this.app.i18n._('host'), width: 30, hidden: true },
            { id: 'insecure', header: this.app.i18n._('insecure'), width: 30, hidden: true },
            { id: 'language', header: this.app.i18n._('language'), width: 30, hidden: true },
            { id: 'mailbox', header: this.app.i18n._('mailbox'), width: 30, sortable: true },
            { id: 'md5secret', header: this.app.i18n._('md5 secret'), width: 30, hidden: true },
            { id: 'nat', header: this.app.i18n._('nat'), width: 30, hidden: true },
            { id: 'deny', header: this.app.i18n._('deny'), width: 30, hidden: true },
            { id: 'permit', header: this.app.i18n._('permit'), width: 30, hidden: true },
            { id: 'mask', header: this.app.i18n._('mask'), width: 30, hidden: true },
            { id: 'pickupgroup', header: this.app.i18n._('pickup group'), width: 40, sortable: true },
            { id: 'port', header: this.app.i18n._('port'), width: 30, hidden: true },
            { id: 'qualify', header: this.app.i18n._('qualify'), width: 30, hidden: true },
            { id: 'restrictcid', header: this.app.i18n._('restrict cid'), width: 30, hidden: true },
            { id: 'rtptimeout', header: this.app.i18n._('rtp timeout'), width: 30, hidden: true },
            { id: 'rtpholdtimeout', header: this.app.i18n._('rtp hold timeout'), width: 30, hidden: true },
            { id: 'secret', header: this.app.i18n._('secret'), width: 30, hidden: true },
            { id: 'type', header: this.app.i18n._('type'), width: 30, sortable: true },
            { id: 'defaultuser', header: this.app.i18n._('defaultuser'), width: 30, hidden: true },
            { id: 'disallow', header: this.app.i18n._('disallow'), width: 30, hidden: true },
            { id: 'allow', header: this.app.i18n._('allow'), width: 30, hidden: true },
            { id: 'musiconhold', header: this.app.i18n._('music on hold'), width: 30, hidden: true },
            { id: 'regseconds', header: this.app.i18n._('reg seconds'), width: 50, renderer: Tine.Tinebase.common.dateTimeRenderer },
            { id: 'ipaddr', header: this.app.i18n._('ip address'), width: 30, hidden: true },
            { id: 'regexten', header: this.app.i18n._('reg exten'), width: 30, hidden: true },
            { id: 'cancallforward', header: this.app.i18n._('can call forward'), width: 30, hidden: true },
            { id: 'setvar', header: this.app.i18n._('set var'), width: 30, hidden: true },
            { id: 'notifyringing', header: this.app.i18n._('notify ringing'), width: 30, hidden: true },
            { id: 'useclientcode', header: this.app.i18n._('use client code'), width: 30, hidden: true },
            { id: 'authuser', header: this.app.i18n._('auth user'), width: 30, hidden: true },
            { id: 'call-limit', header: this.app.i18n._('call limit'), width: 30, hidden: true },
            { id: 'busy-level', header: this.app.i18n._('busy level'), width: 30, hidden: true }
        ];
        return columns;
    },
    
    initDetailsPanel: function() { return false; },
    
    /**
     * return additional tb items
     * 
     * @todo add duplicate button
     * @todo move export buttons to single menu/split button
     */
    getToolbarItems: function(){
        return [

        ];
    }
    
});
