/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
Ext.ns('Tine.Tinebase');

/**
 * Tine 2.0 jsclient MainScreen with app selection, menu etc.
 * 
 * @namespace   Tine.Tinebase
 * @class       Tine.Tinebase.MainScreenPanel
 * @extends     Ext.Container
 * @singleton   
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */

Tine.Tinebase.MainScreenPanel = function(config) {
    this.addEvents(
        /**
         * @event beforeappappactivate
         * fired before an application gets appactivated. Retrun false to stop activation
         * @param {Tine.Aplication} app about to appactivate
         */
        'beforeappappactivate',
        /**
         * @event appactivate
         * fired when an application gets appactivated
         * @param {Tine.Aplication} appactivated app
         */
        'appactivate',
        /**
         * @event beforeappappdeactivate
         * fired before an application gets appdeactivated. Retrun false to stop deactivation
         * @param {Tine.Aplication} app about to appdeactivate
         */
        'beforeappappdeactivate',
        /**
         * @event appdeactivate
         * fired when an application gets appdeactivated
         * @param {Tine.Aplication} appdeactivated app
         */
        'appdeactivate',
        /**
         * @event windowopenexception
         * windowopenexceptionated
         * @param {} Exception
         */
        'windowopenexception'
    );

    // NOTE: this is a cruid method to create some kind of singleton...
    Tine.Tinebase.MainScreen = this;

    Tine.Tinebase.MainScreenPanel.superclass.constructor.call(this, config);
}

Ext.extend(Tine.Tinebase.MainScreenPanel, Ext.Container, {
    
    border: false,
    layout: {
        type:'vbox',
        align:'stretch',
        padding:'0'
    },

    /**
     * the active app
     * @type {Tine.Tinebase.Application}
     */
    app: null,

    /**
     * @private
     */
    initComponent: function() {
        this.initLayout();
        this.supr().initComponent.apply(this, arguments);
    },

    /**
     * @private
     */
    initLayout: function() {
        this.items = [{
            ref: 'topBox',
            cls: 'tine-mainscreen-topbox',
            border: false,
            html: '<div class="tine-mainscreen-topbox-left"></div><div class="tine-mainscreen-topbox-middle"></div><div class="tine-mainscreen-topbox-right"></div>'
        }, {
            cls: 'tine-mainscreen-mainmenu',
            height: 20,
            layout: 'fit',
            border: false,
            items: this.getMainMenu()
        }, {
            ref: 'appTabs',
            cls: 'tine-mainscreen-apptabs',
            hidden: this.hideAppTabs,
            border: false,
            height: 20,
            items: new Tine.Tinebase.AppTabsPanel({
                plain: true
            })
        }, {
            ref: 'centerPanel',
            cls: 'tine-mainscreen-centerpanel',
            flex: 1,
            border: false,
            layout: 'card'
        }];
    },
    
    /**
     * returns main menu
     * 
     * @return {Ext.Menu}
     */
    getMainMenu: function() {
        if (! this.mainMenu) {
            this.mainMenu = new Tine.Tinebase.MainMenu({
                showMainMenu: false
            });
        }
        
        return this.mainMenu;
    },

    /**
     * returns center (card) panel
     *
     * @returns {Ext.Panel}
     */
    getCenterPanel: function() {
        return this.centerPanel;
    },

    /**
     * appMgr app activation listener
     * 
     * @param {Tine.Application} app
     */
    onAppActivate: function(app) {
        Tine.log.info('Activating app ' + app.appName);
        
        this.app = app;
        
        // set document / browser title
        var postfix = (Tine.Tinebase.registry.get('titlePostfix')) ? Tine.Tinebase.registry.get('titlePostfix') : '',
            // some apps (Felamimail atm) can add application specific title postfixes
            // TODO generalize this
            appPostfix = (document.title.match(/^\([0-9]+\) /)) ? document.title.match(/^\([0-9]+\) /)[0] : '';
        document.title = Ext.util.Format.stripTags(appPostfix + Tine.title + postfix  + ' - ' + app.getTitle());
    },
    
    /**
     * executed after rendering process
     * 
     * @private
     */
    afterRender: function() {
        this.supr().afterRender.apply(this, arguments);

        var expiredSince = Tine.Tinebase.registry.get('licenseExpiredSince');
        if (expiredSince && expiredSince != false) {

            var licensePopup = new Ext.Window({
                title: i18n._('License expired'),
                
                layout:'fit',
                width:500,
                height:100,

                closable: false,

                items: new Ext.Panel({
                    html: i18n._('Your Tine 2.0 Business Edition license expired. Please buy a license at:') + '<br/><a target="_blank" href="' + Tine.shop + '" border="0"> Tine 2.0 Shop </a></ul>'
                }),

                buttons: [{
                    text: 'Close',
                    disabled: true,
                    handler: function(ev){
                        licensePopup.hide();
                    },
                    listeners: {
                        afterrender: function (btn) {
                            setTimeout(function(){
                                btn.setDisabled(false);
                            }, expiredSince * 1000);
                        }
                    }
                }]
            });

            licensePopup.show();
        }

        if (Tine.Tinebase.registry.get('mustchangepw')) {
            var passwordDialog = new Tine.Tinebase.PasswordChangeDialog({
                title: i18n._('Your password expired. Please enter a new user password:')
            });
            passwordDialog.show();
        }
    },

    /**
     * activate application
     *
     * @param {Tine.Application} app
     * @return {Boolean}
     */
    activate: function(app) {
        if (app) {
            // activation via routing only
            if (Tine.Tinebase.router.getRoute()[0] != app.appName) {
                Tine.Tinebase.router.setRoute('/' + app.appName);
                return;
            }

            if (app == this.getActiveApp()) {
                // app is already active, nothing to do
                return true;
            }

            if (this.app) {
                if ((this.fireEvent('beforeappappdeactivate', this.app) === false || this.app.onBeforeDeActivate() === false)) {
                    return false;
                }

                this.app.onDeActivate();
                this.fireEvent('appdeactivate', this.app);
                this.app = null;
            }

            if (this.fireEvent('beforeappappactivate', app) === false || app.onBeforeActivate() === false) {
                return false;
            }

            this.setActiveCenterPanel(app.getMainScreen(), true);

            this.app = app;
            this.onAppActivate(app);

            app.onActivate();
            this.fireEvent('appactivate', app);
        } else {
            app = Tine.Tinebase.appMgr.getDefault();
            Tine.Tinebase.router.setRoute('/' + app.appName);
        }
    },

    /**
     * returns currently activated app
     * @return {Tine.Application}
     */
    getActiveApp: function() {
        return this.app;
    },

    /**
     * set the active center panel
     * @param panel
     */
    setActiveCenterPanel: function(panel, keep) {
        if (panel.app) {
            // neede for legacy handling
            this.app = panel.app;
        }
        var cardPanel = this.getCenterPanel();

        Ext.ux.layout.CardLayout.helper.setActiveCardPanelItem(cardPanel, panel, keep);
    },


    /**
     * sets the active content panel
     *
     * @deprecated
     * @param {Ext.Panel} item Panel to activate
     * @param {Bool} keep keep panel
     */
    setActiveContentPanel: function(panel, keep) {
        Tine.log.warn('Tine.Tinebase.MainScreenPanel.setActiveContentPanel is deprecated, use <App>.Mainscreen.setActiveContentPanel instead ' + new Error().stack);
        return this.app.getMainScreen().setActiveContentPanel(panel, keep);
    },

    /**
     * sets the active tree panel
     *
     * @deprecated
     * @param {Ext.Panel} panel Panel to activate
     * @param {Bool} keep keep panel
     */
    setActiveTreePanel: function(panel, keep) {
        Tine.log.warn('Tine.Tinebase.MainScreenPanel.setActiveTreePanel is deprecated, use <App>.Mainscreen.setActiveTreePanel instead ' + new Error().stack);
        return this.app.getMainScreen().setActiveTreePanel(panel, keep);
    },

    /**
     * sets the active module tree panel
     *
     * @deprecated
     * @param {Ext.Panel} panel Panel to activate
     * @param {Bool} keep keep panel
     */
    setActiveModulePanel: function(panel, keep) {
        Tine.log.warn('Tine.Tinebase.MainScreenPanel.setActiveModulePanel is deprecated, use <App>.Mainscreen.setActiveModulePanel instead ' + new Error().stack);
        return this.app.getMainScreen().setActiveModulePanel(panel, keep);
    },

    /**
     * sets item
     *
     * @deprecated
     * @param {Ext.Toolbar} panel toolbar to activate
     * @param {Bool} keep keep panel
     */
    setActiveToolbar: function(panel, keep) {
        Tine.log.warn('Tine.Tinebase.MainScreenPanel.setActiveToolbar is deprecated, use <App>.Mainscreen.setActiveToolbar instead ' + new Error().stack);
        return this.app.getMainScreen().setActiveToolbar(panel, keep);
    },

    /**
     * gets the currently displayed toolbar
     *
     * @deprecated
     * @return {Ext.Toolbar}
     */
    getActiveToolbar: function() {
        Tine.log.warn('Tine.Tinebase.MainScreenPanel.getActiveToolbar is deprecated, use <App>.Mainscreen.getActiveToolbar instead ' + new Error().stack);
        return this.app.getMainScreen().getActiveToolbar();
    }
});

/**
 * lazy mainscreen init
 *
 * @static
 * @param app
 */
Tine.Tinebase.MainScreenPanel.show = function(app) {
    var mainCardPanel = Tine.Tinebase.viewport.tineViewportMaincardpanel;

    if (! Tine.Tinebase.MainScreen) {
        new Tine.Tinebase.MainScreenPanel();
        mainCardPanel.add(Tine.Tinebase.MainScreen);
        mainCardPanel.layout.setActiveItem(Tine.Tinebase.MainScreen.id);
        Tine.Tinebase.MainScreen.doLayout();
    }

    Tine.Tinebase.MainScreen.activate(app);
};
