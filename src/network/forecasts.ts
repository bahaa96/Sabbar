import instance from './instance';

interface RequestFetchCityForecastArgs {
  latitude: string;
  longitude: string;
  startDate: string;
  endDate: string;
  weatherVariables: string[];
  options?: {
    signal?: AbortSignal;
  };
}

interface RequestFetchCityForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    temperature_2m: string;
    relativehumidity_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relativehumidity_2m: number[];
  }
}

const requestFetchCityForecast = async ({ options, ...params }: RequestFetchCityForecastArgs) => {
  const { data } = await instance.get<RequestFetchCityForecastResponse>('/forecast', {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      'start_date': params.startDate,
      'end_date': params.endDate,
      hourly: params.weatherVariables
    },
    signal: options?.signal
  });

  return data;
};

export { requestFetchCityForecast };