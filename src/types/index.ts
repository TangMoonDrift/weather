export interface ApiResult {
  city: string,
  cityid: string,
  update_time: string,
  data: WeatherInfo[]
}

export interface WeatherInfo {
  date: string,
  wea: string,
  wea_img: string,
  tem_day: string,
  tem_night: string,
  win: string,
  win_speed: string
}
