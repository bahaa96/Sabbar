import type { City } from '../domain-models';
import citiesServiceInstance from './CitiesInstance';

interface RequestFetchCityListArgs {
  name: string;
  count: number;
  options?: {
    signal?: AbortSignal
  }
}

interface RequestFetchCityForecastResponse {
  results: City[]
}

const requestFetchCityList = async ({
  name,
  count,
  options,
}: RequestFetchCityListArgs): Promise<City[]> => {
  const { data } = await citiesServiceInstance.get<RequestFetchCityForecastResponse>('/search', {
    params: { name, count },
    signal: options?.signal,
  });
  return data?.results;
};

export { requestFetchCityList };
