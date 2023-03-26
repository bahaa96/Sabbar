export interface Report {
  reportId: string;
  cities: string[];
  coordinatesRange: string[];
  creationDate: string;
  dateRange: string[];
  includedData: string;
  weatherVariables: string[];
  report: {
    cityName: string;
    longitude: string;
    latitude: string;
    dateRange: string[];
  }[];
}
