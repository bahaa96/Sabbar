import { useEffect, useState } from 'react';
import { Typography, Table, Button, notification, } from 'antd';
import { DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import type { Report } from '../../domain-models';

import classes from './index.module.css';


const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportsList, setReportsList] = useState<Report[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const hasSelected = selectedRowKeys.length > 0;

  const handleDeleteReportsBatch = async (targetReportIds: React.Key[]) => {
    try {
      setIsLoading(true);
      // network loading simulation 
      await (new Promise(res => setTimeout(res, 500)));
      const reports: Report[] = JSON.parse(await localStorage.getItem('reports') || '');
      const newReports = reports.filter((report: Report) => {
        let isMatching = false;
        for (let i = 0; i < targetReportIds.length; i++) {
          if (targetReportIds[i] == report.reportId) {
            isMatching = true;
            break;
          }
        }
        return !isMatching;
      });
      setReportsList(newReports);
      localStorage.setItem('reports', JSON.stringify(newReports));
      setSelectedRowKeys([]);
      setIsLoading(false);
    } catch (e) {
      notification.error({
        placement: 'bottom',
        message: 'Something went wrong',
        description: (e as Error).message
      });
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      // network loading simulation 
      try {
        await (new Promise(res => setTimeout(res, 500)));
        const reportsData = JSON.parse(await localStorage.getItem('reports') || '');
        setReportsList(reportsData);
        setIsLoading(false);
      } catch (e) {
        notification.error({
          placement: 'bottom',
          message: 'Something went wrong',
          description: (e as Error).message
        });
      }

    })();
  }, []);



  return (
    <div>
      <Typography.Title level={1} className={classes.pageTitle}>
        Saved Reports
      </Typography.Title>
      <div className={classes.tableActions}>
        <Button type="primary" onClick={() => handleDeleteReportsBatch(selectedRowKeys)} disabled={!hasSelected} loading={isLoading}>
          Delete Selected
        </Button>
        <Typography.Text className={classes.tableSelectedItemsStatus}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </Typography.Text>
      </div>
      <Table<Report> dataSource={reportsList} loading={isLoading} rowKey={'reportId'}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
      >
        <Table.Column
          title="Cities"
          dataIndex="cities"
          key="cities"
          render={(cities: string[], { reportId }: Report) => (
            <Link to={`/report/${reportId}`} >
              {cities.join(', ')}
            </Link>
          )}
        />
        <Table.Column title="Included Data" dataIndex="includedData" key='includedData' />
        <Table.Column
          title="Longitude & Latitude"
          dataIndex="coordinatesRange"
          key="coordinatesRange"
          render={(coordinatesRange: string[]) => coordinatesRange.join(', ')}

        />
        <Table.Column
          title="Date Range"
          dataIndex="dateRange"
          key="dateRange"
          render={(dateRange: string[]) => {
            return `${dateRange[0]}  -  ${dateRange[1]}`;
          }}
        />
        <Table.Column title="Creation Date" dataIndex="creationDate" key='creationDate'
          sorter={(a: Report, b: Report) => {
            if (dayjs(a.creationDate, 'DD/MM/YYYY').isBefore(dayjs(b.creationDate, 'DD/MM/YYYY'))) { return -1; }
            if (dayjs(a.creationDate, 'DD/MM/YYYY').isAfter(dayjs(b.creationDate, 'DD/MM/YYYY'))) { return 1; }
            return 0;
          }}
          render={(date: string) => date}
        />
        <Table.Column
          title={null}
          dataIndex="reportId"
          key="reportId"
          render={(reportId: string) => (
            <div className={classes.tableActionsColumn}>
              <Button type='text' size='small'>
                <Link to={`/report/${reportId}`}>
                  <EyeOutlined />
                </Link>
              </Button>
              <Button type='text' size='small'>
                <Link to={`/report/${reportId}`} >
                  <EditOutlined />
                </Link>
              </Button>
              <Button
                type='text'
                size='small'
                onClick={() => handleDeleteReportsBatch([reportId])}
              >
                <DeleteOutlined />
              </Button>
            </div>
          )}
        />
      </Table>
    </div>
  );
};

export default ReportsPage; 