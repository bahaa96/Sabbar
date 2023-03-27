import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Typography, Button, Select, DatePicker, Checkbox, theme, notification } from 'antd';
import type { SelectProps } from 'antd';
import { MinusCircleOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { v4 as uuid } from 'uuid';
import { Area } from '@ant-design/plots';

import { requestFetchCityForecast, requestFetchCityList } from '../../network';
import { Chart, Report } from '../../domain-models';
import transparentize from '../../lib/transparentize';

import classes from './index.module.css';

const MAXIMUM_FORECAST_DATE_RANGE = 7;
const INITIAL_CITY_ROW_DATA = {
  latitude: undefined,
  longitude: undefined,
  city: undefined,
  dateRange: undefined
};

const fetchAllCities = async (cityName: string): Promise<{
  key: string;
  label: string;
  value: string;
}[]> => {
  return requestFetchCityList({ name: cityName, count: 5 })
    .then((results) => {
      return results.map(
        (city) => ({
          key: String(city.id),
          label: city.name,
          value: `${city.latitude},${city.longitude}`,
        })
      );
    });
};

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode | string; value: string | number } = any,
  >({ fetchOptions, debounceTimeout = 400, ...props }: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const INITIAL_SEARCH_TERM = 'Riyadh';

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  useEffect(() => {
    debounceFetcher(INITIAL_SEARCH_TERM);
  }, []);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <LoadingOutlined /> : null}
      {...props}
      options={options}
      showSearch
    />
  );
}

interface FormValues {
  cities: {
    latitude: string;
    longitude: string;
    city: {
      key: React.Key;
      label: string;
      value: string;
    };
    dateRange: [Dayjs, Dayjs];
  }[];
  weatherVariables: string[];
}

const WeatherPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [isLoadingReportData, setIsLoadingReportData] = useState(false);

  const [reportForm] = Form.useForm<FormValues>();
  const [formRowsErrorList, setFormRowsErrorList] = useState<(string | undefined)[]>([]);
  const [chartsData, setChartsData] = useState<Chart[]>([]);

  const { token: { colorPrimary } } = theme.useToken();

  const handleSaveReport = async () => {
    const formData = reportForm.getFieldsValue();
    let savedReports: Report[] = [];

    let savedReportsString;
    try {
      savedReportsString = await localStorage.getItem('reports');
    } catch (e) {
      notification.error({
        placement: 'bottom',
        message: 'Something went wrong',
        description: (e as Error).message
      });
    }

    if (savedReportsString) {
      savedReports = JSON.parse(savedReportsString);
    }

    const reportDateRange: Dayjs[] = [];
    formData.cities.forEach(city => city.dateRange.forEach(date => reportDateRange.push(date)));

    const reportCoordinatesRange: number[] = [];
    formData.cities.forEach(({ latitude, longitude, city }) => {
      let _lat: string | undefined = latitude;
      let _lng: string | undefined = longitude;
      if (!latitude || !longitude) {
        [_lat, _lng] = city.value.split(',');
      }
      reportCoordinatesRange.push(Number(_lat));
      reportCoordinatesRange.push(Number(_lng));
    });

    let reportStatus = '';
    if (formData.weatherVariables.length === 2) {
      reportStatus = 'Temperature and relative humidity';
    } else if (formData.weatherVariables.length < 2) {
      if (formData.weatherVariables[0] === 'temperature_2m') {
        reportStatus = 'Temperature only';
      } else {
        reportStatus = 'Relative humidity only';
      }
    }

    const newReport: Report = {
      reportId: uuid(),
      cities: formData.cities.map(({ city }) => city.label),
      coordinatesRange: [
        String(Math.min(...reportCoordinatesRange)),
        String(Math.max(...reportCoordinatesRange))
      ],
      creationDate: dayjs().format('DD/MM/YYYY'),
      dateRange: [
        dayjs.min(reportDateRange).format('DD/MM/YYYY'),
        dayjs.max(reportDateRange).format('DD/MM/YYYY'),
      ],
      includedData: reportStatus,
      weatherVariables: formData.weatherVariables,
      report: formData.cities.map(({ latitude, longitude, city, dateRange }) => {
        let _lat: string | undefined = latitude;
        let _lng: string | undefined = longitude;
        if (!latitude || !longitude) {
          [_lat, _lng] = city.value.split(',');
        }
        return {
          cityName: city.label,
          latitude: _lat,
          longitude: _lng,
          dateRange: dateRange.map(date => date.format('DD/MM/YYYY')),
        };
      }),
    };

    const newReports: Report[] = [newReport, ...savedReports];

    try {
      await localStorage.setItem('reports', JSON.stringify(newReports));
    } catch (e) {
      notification.error({
        placement: 'bottom',
        message: 'Something went wrong',
        description: (e as Error).message
      });
    }

    notification.success({
      message: 'Report added successfully',
      placement: 'bottom',
      description: 'Report has been added successfully',
    });

    navigate('/reports');

  };

  const onFinish = async ({ cities, weatherVariables }: FormValues) => {
    // Cities coordinates validation
    let errorCount = 0;
    setFormRowsErrorList([]);
    const errorList = cities.map(({ latitude, longitude, city }) => {
      if (!(latitude && longitude) && !city) {
        errorCount += 1;
        return 'City or coordinates is required';
      }
    });

    if (errorCount) {
      setFormRowsErrorList(errorList);
      return;
    }

    try {
      const citiesCharts = await Promise.all(cities.map(({ latitude, longitude, city, dateRange: [startDate, endDate] }) => {
        let _lat: string | undefined = latitude;
        let _lng: string | undefined = longitude;
        if (!latitude || !longitude) {
          [_lat, _lng] = city.value.split(',');
        }

        return requestFetchCityForecast({
          latitude: _lat,
          longitude: _lng,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          weatherVariables: weatherVariables,
        });
      }));
      setChartsData(citiesCharts);
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
      if (!reportId) {
        setChartsData([]);
        reportForm.resetFields();
        reportForm.setFieldsValue({
          cities: [INITIAL_CITY_ROW_DATA]
        });
        return;
      }

      setIsLoadingReportData(true);

      let reportsDataString;
      try {
        reportsDataString = await localStorage.getItem('reports');
      } catch (e) {
        notification.error({
          placement: 'bottom',
          message: 'Something went wrong',
          description: (e as Error).message
        });
      }

      if (reportsDataString) {
        const reportsData: Report[] = JSON.parse(reportsDataString);
        const targetReportData = reportsData.find(report => report.reportId === reportId);
        if (targetReportData) {
          reportForm.setFieldsValue({
            cities: targetReportData.report.map((city) => {
              return {
                city: {
                  key: `${city.latitude},${city.longitude}`,
                  label: city.cityName,
                  value: `${city.latitude},${city.longitude}`,
                },
                latitude: city.latitude,
                longitude: city.longitude,
                dateRange: [dayjs(city.dateRange[0], 'DD/MM/YYYY'), dayjs(city.dateRange[1], 'DD/MM/YYYY')],
              };
            })
          });
          onFinish({
            cities: targetReportData?.report.map((city) => {

              return {
                city: {
                  key: `${city.latitude},${city.longitude}`,
                  label: city.cityName,
                  value: `${city.latitude},${city.longitude}`,
                },
                latitude: city.latitude,
                longitude: city.longitude,
                dateRange: [dayjs(city.dateRange[0], 'DD/MM/YYYY'), dayjs(city.dateRange[1], 'DD/MM/YYYY')],
              };
            }), weatherVariables: targetReportData?.weatherVariables
          });

          setIsLoadingReportData(false);
        }
      }
    })();
  }, [reportId]);

  return (
    <div>
      <Typography.Title level={1}>
        Weather Page
      </Typography.Title>
      <Card className={classes.container} loading={isLoadingReportData}>
        <Typography.Title level={5}>
          Select Coordinates or City
        </Typography.Title>
        <Form<FormValues>
          form={reportForm}
          onFinish={onFinish}
          autoComplete="off"
          scrollToFirstError
        >
          <Form.List
            name="cities"
            initialValue={[INITIAL_CITY_ROW_DATA]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className={classes.reportFormRow}>
                    <Form.Item
                      {...restField}
                      name={[name, 'latitude']}
                      help={
                        <Typography.Text className={classes.reportFormRowError}>
                          {formRowsErrorList[name]}
                        </Typography.Text>
                      }
                    >
                      <Input placeholder="Latitude" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'longitude']}>
                      <Input placeholder="Longitude" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'city']}>
                      <DebounceSelect
                        placeholder="Select City"
                        fetchOptions={fetchAllCities}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'dateRange']}
                      initialValue={[dayjs(), dayjs().add(MAXIMUM_FORECAST_DATE_RANGE, 'day')]}
                      rules={[{
                        validator: (_, value) => {

                          if (!value) {
                            return Promise.reject('Date range is required');
                          }
                          const [startDate, endDate] = value;

                          if (endDate.diff(startDate, 'day') > MAXIMUM_FORECAST_DATE_RANGE) {
                            return Promise.reject('Date range must be within 7 days');
                          }

                          return Promise.resolve();
                        }
                      }]}
                    >
                      <DatePicker.RangePicker
                        format={'DD/MM/YYYY'}
                        inputReadOnly
                      />
                    </Form.Item>
                    <div>
                      {
                        (fields.length > 1) && (
                          <Button type='text' onClick={() => remove(name)}>
                            <MinusCircleOutlined />
                          </Button>
                        )
                      }
                    </div>
                  </div>
                ))}
                <div className={classes.formListControls}>
                  <Button
                    type="primary"
                    size='small'
                    icon={<PlusOutlined />}
                    className={classes.addReportFormRowButton}
                    onClick={() => add()}
                  />
                </div>
              </>
            )}
          </Form.List>
          <Form.Item
            name={'weatherVariables'}
            initialValue={['temperature_2m']}
            rules={[{
              required: true,
              message: 'Please select at least one weather variable'
            }]}
          >
            <Checkbox.Group
              options={[
                { label: 'Temperature', value: 'temperature_2m' },
                { label: 'Relative Humidity', value: 'relativehumidity_2m' },
              ]
              }
            />
          </Form.Item>
          <div className={classes.reportFormControls}>
            <Button type="primary" htmlType="submit" className={classes.reportFormControlButton}>
              Preview Charts
            </Button>
            <Button
              type="primary"
              className={classes.reportFormControlButton}
              onClick={handleSaveReport}
              disabled={Boolean(!chartsData.length)}
            >
              Save
            </Button>

          </div>
        </Form>
        <div className={classes.chartsContainer}>
          {!!chartsData.length && (
            <Fragment>
              <div className={classes.chartsContainerChartList}>
                {
                  chartsData.map((chart, index) => {
                    const categories: Array<Exclude<keyof Chart['hourly'], 'time'>> =
                      Object.keys(chart.hourly).filter(key => key != 'time') as Array<Exclude<keyof Chart['hourly'], 'time'>>;
                    const data: Array<{ time: string; value: number; category: string; }> = [];
                    for (let index = 0; index < chart.hourly.time.length; index++) {
                      categories.forEach((category) => data.push({
                        time: chart.hourly.time[index],
                        value: chart.hourly[category][index],
                        category
                      }));
                    }

                    return (
                      <Area
                        data={data}
                        key={index}
                        xField={'time'}
                        yField={'value'}
                        seriesField={'category'}
                        xAxis={{
                          type: 'time',
                        }}
                        yAxis={{
                          label: {
                            formatter: (v) => `${v}`.replace(/\d{1, 3}(?=(\d{3})+$)/g, (s) => `${s},`),
                          },
                        }}
                        color={[colorPrimary, transparentize(colorPrimary, 0.7)]}
                        className={classes.lineChart}
                      />
                    );
                  })
                }
              </div>
              <div className={classes.chartsContainerFooter}>
                <Typography.Text>
                  All Shown Forecasts shown are in GMT time.
                </Typography.Text>
              </div>
            </Fragment>
          )}

        </div>
      </Card>
    </div>
  );
};

export default WeatherPage;