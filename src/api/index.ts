import type { ApiResult } from '../types';

export const fetchWeatherInfo : (id: string) => Promise<ApiResult> = async (id: string) => {
  const url = `http://v1.yiketianqi.com/free/week?unescape=1&appid=57472564&appsecret=goB4ufOi&cityid=${ id }`;
  return await fetch(url).then(response => response.json());
};

