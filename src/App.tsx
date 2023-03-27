import { useState } from 'react';
import {
  FireOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Layout, Menu } from 'antd';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import WeatherPage from './pages/WeatherPage';
import ReportsPage from './pages/ReportsPage';
import theme from './theme';

import Logo from './assets/logo-en.png';

import classes from './App.module.css';



const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <Layout className={classes.layout}>
          <Layout.Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className={classes.logoWrapper}>
              <img src={Logo} className={classes.logo} />
            </div>
            <Menu theme="dark" defaultSelectedKeys={['weather']} mode="inline" items={[
              {
                key: 'weather',
                label: <Link to={'/'}>Weather</Link>,
                icon: <FireOutlined />,
              },
              {
                key: 'reports',
                label: <Link to={'/reports'}>Reports</Link>,
                icon: <FileSearchOutlined />,
              }
            ]}
            />
          </Layout.Sider>
          <Layout className="site-layout">
            <Layout.Header className={classes.layoutHeader} />
            <Layout.Content className={classes.contentWrapper}>
              <Routes>
                <Route path={'/'} Component={WeatherPage} />
                <Route path={'report/:reportId'} Component={WeatherPage} />
                <Route path={'reports'} Component={ReportsPage} />
              </Routes>
            </Layout.Content>
            <Layout.Footer style={{ textAlign: 'center' }}>
              © 2023 Sabbar Inc.
            </Layout.Footer>
          </Layout>
        </Layout>
      </ConfigProvider >
    </BrowserRouter>
  );
};

export default App;
