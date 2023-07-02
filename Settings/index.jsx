import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Equipment from './equipment';
import MasterBulletin from './masterBulletin';
import MasterSettings from './masterSettings';
import Studios from './studios';
import Currency from './currency';
import QuoteSetup from './QuoteSetup/quoteSetup';
import TierSetup from './tierSetup';
import Notifications from './notifications';
import TopNavBar from 'components/topNavBar';
import { Link } from 'react-router-dom';
import RightAngle from 'components/angleRight';
import { AuthContext } from 'contexts/auth.context';
import classNames from './settings.module.css';

const Settings = () => {
  // const authProvider = useContext(AuthContext);
  const { permissions } = useContext(AuthContext);
  const [key, setKey] = useState('masterSettings');

  let accessCheck = {
    bcLink: '',
    bcText: '',
  };

  useEffect(() => {
    let accessCheck = {
      bcLink: '',
      bcText: '',
    };
    if (permissions['Settings']?.['Master Settings']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Master Settings',
      };
      setKey('masterSettings');
    } else if (permissions['Settings']?.['Master Bulletin']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Master Bulletin',
      };
      setKey('masterBulletin');
    } else if (permissions['Settings']?.['Equipment']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Equipment',
      };
      setKey('equipment');
    } else if (permissions['Settings']?.['Studios']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Studios',
      };
      setKey('studios');
    } else if (permissions['Settings']?.['Currency']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Currency',
      };
      setKey('currency');
    } else if (permissions['Settings']?.['Notifications']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Notifications',
      };
      setKey('notifications');
    } else if (!permissions['Settings']?.['Quote Setup']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Quote Setup',
      };
      setKey('QuoteSetup');
    } else if (!permissions['Settings']?.['Tier Setup']?.isView) {
      accessCheck = {
        bcLink: '/settings',
        bcText: 'Tier Setup',
      };
      setKey('tierSetup');
    }
    setBedcrump(accessCheck);
  }, [permissions]);

  const [breadCrump, setBedcrump] = useState(accessCheck);

  const setBreadCrump = (tabKey) => {
    switch (tabKey) {
      case 'masterSettings':
        setBedcrump({
          bcText: 'Master Settings',
        });
        break;
      case 'masterBulletin':
        setBedcrump({ bcText: 'Master Bulletin' });
        break;
      case 'equipment':
        setBedcrump({ bcText: 'Equipment' });
        break;
      case 'studios':
        setBedcrump({ bcText: 'Studios' });
        break;
      case 'currency':
        setBedcrump({ bcText: 'Currency' });
        break;
      case 'notifications':
        setBedcrump({ bcText: 'Notifications' });
        break;
      case 'QuoteSetup':
        setBedcrump({ bcText: 'Quote Setup' });
        break;
      case 'tierSetup':
        setBedcrump({ bcText: 'Tier Setup' });
        break;
    }
  };

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">{breadCrump.bcText}</Link>
        </li>
      </TopNavBar>
      <div className={'side-custom-tabs Settings_tab_tabpane'}>
        <Tabs
          id="left-tabs-example"
          className=""
          unmountOnExit={true}
          activeKey={key}
          onSelect={(k) => {
            setKey(k);
            for (var i in window.row_ids) {
              delete window.row_ids[i];
            }
            setBreadCrump(k);
          }}
        >
          {permissions['Settings']?.['Master Settings']?.isView && (
            <Tab
              eventKey="masterSettings"
              title='Master Settings'
              className={classNames["master-settings-tabPane"]}
            >
              <MasterSettings />
            </Tab>
          )}
          {permissions['Settings']?.['Master Bulletin']?.isView && (
            <Tab
              eventKey="masterBulletin"
              className={"master-bulletin-tabPane " + classNames["bulletin-tabPane"]}
              title='Master Bulletin'
            >
              <MasterBulletin />
            </Tab>
          )}
          {permissions['Settings']?.['Equipment']?.isView && (
            <Tab
              eventKey="equipment"
              title='Equipment'
              className={classNames["equipment-tabPane"]}
            >
              <Equipment />
            </Tab>
          )}
          {permissions['Settings']?.['Studios']?.isView && (
            <Tab
              eventKey="studios"
              title='Studios'
              className={classNames["studios-tabPane"]}
            >
              <Studios />
            </Tab>
          )}
          {permissions['Settings']?.['Currency']?.isView && (
            <Tab
              eventKey="currency"
              title='Currency'
              className={classNames["currency-tabPane"]}
            >
              <Currency />
            </Tab>
          )}
          {permissions['Settings']?.['Quote Setup']?.isView && (
            <Tab
              eventKey="QuoteSetup"
              title='Quote Setup'
              className={"quote-setup-tabPane "  + classNames["quotesetup-filter"]}
            >
              <QuoteSetup />
            </Tab>
          )}
          {permissions['Settings']?.['Tier Setup']?.isView && (
            <Tab
              eventKey="tierSetup"
              title='Tier Setup'
              className={"tier-setup-tabPane " + classNames["tiersetup-filter"]}
            >
              <TierSetup />
            </Tab>
          )}
          {/* )} */}
          {/* {authProvider.canView.settings_notifications && (
            <Tab
              eventKey="notifications"
              title='Notifications'
              className={classNames["notification-tabPane"]}
            >
              <Notifications />
            </Tab>
          )} */}
        </Tabs>
      </div>
    </>
  );
};

export default Settings;
