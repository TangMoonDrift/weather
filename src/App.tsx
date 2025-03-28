import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as Echarts from 'echarts';
import { fetchWeatherInfo } from './api';
import type { WeatherInfo } from './types';
import { citiesList } from './constants/city';
import { debounce } from './utils';
import './App.css';

type EChartsOption = Echarts.EChartsOption;

function App() {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<Echarts.ECharts | null>(null);
  const [dates, SetDates] = useState<Array<string>>(['10.1', '10.2', '10.3', '10.4', '10.5', '10.6', '10.7']);
  const [cities, setCities] = useState<Array<{ city: string, cityid: string }>>([{
    city: '北京',
    cityid: '101010100',
  }]);
  const [city, setCity] = useState<{ city: string, cityid: string }>({ city: '上海', cityid: '101020100' });
  const [filter, setFilter] = useState<Array<{ city: string, cityid: string }>>([]);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
    tem_day: '30',
    tem_night: '20',
    win: '西南',
    win_speed: '2',
    wea: '晴',
    date: '10.1',
    wea_img: '',
  });
  const [highest, setHighest] = useState<Array<number>>([30, 40, 30, 40, 30, 40, 30]);
  const [lowest, setLowest] = useState<Array<number>>([1, -2, 2, 5, 3, 2, 0]);
  const displayFilter = useMemo(() => {
    return filter.length ? <div className={ 'filter-list' } style={ { padding: 0, boxSizing: 'border-box' } }>
      {
        filter.map((item) => (
          <span key={ item.cityid } onClick={ () => {
            setCity(() => item);
            setFilter([]);
          } }>{ item.city }</span>
        ))
      }
    </div> : null;
  }, [filter]);

  useEffect(() => {
    setCities(citiesList);
  }, []);

  useEffect(() => {
    poll();
  }, [city]);

  useEffect(() => {
    const timer = setInterval(() => {
      poll();
    }, 1000 * 60 * 60);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (container.current) {
      chart.current = renderChart(container.current);
      if (chart.current) {
        const option: EChartsOption = {
          title: {
            text: '一周天气',
            textStyle: {
              color: '#262626',
              fontSize: 20,
            },
          },
          tooltip: {
            trigger: 'axis',
          },
          legend: {},
          toolbox: {
            show: true,
            feature: {
              dataZoom: {
                yAxisIndex: 'none',
              },
              dataView: { readOnly: false },
              magicType: { type: ['line', 'bar'] },
              restore: {},
              saveAsImage: {},
            },
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value} °C',
            },
          },
          series: [
            {
              name: 'Highest',
              type: 'line',
              data: highest,
              markPoint: {
                data: [
                  { type: 'max', name: 'Max' },
                  { type: 'min', name: 'Min' },
                ],
              },
              markLine: {
                data: [{ type: 'average', name: 'Avg' }],
              },
            },
            {
              name: 'Lowest',
              type: 'line',
              data: lowest,
              markPoint: {
                data: [{ name: '周最低', value: -2, xAxis: 1, yAxis: -1.5 }],
              },
              markLine: {
                data: [
                  { type: 'average', name: 'Avg' },
                  [
                    {
                      symbol: 'none',
                      x: '90%',
                      yAxis: 'max',
                    },
                    {
                      symbol: 'circle',
                      label: {
                        position: 'start',
                        formatter: 'Max',
                      },
                      type: 'max',
                      name: '最高点',
                    },
                  ],
                ],
              },
            },
          ],
        };
        chart.current.setOption(option);
      }
    }

    return () => {
      if (chart.current) {
        chart.current.dispose();
      }
    };
  }, [lowest, highest, dates]);

  function renderChart(container: HTMLDivElement): Echarts.ECharts | null {
    return Echarts.init(container);
  }

  function refresh() {
    setCity((prevCity) => ({ ...prevCity }));
  }

  function poll() {
    fetchWeatherInfo(city.cityid).then((res) => {
      const { data } = res;
      setWeatherInfo(data[0]);
      const h: number[] = [];
      const l: number[] = [];
      const d: string[] = [];
      data.forEach((item) => {
        h.push(+item.tem_day);
        l.push(+item.tem_night);
        const dateSplits = item.date.split('-');
        const dateStr = `${ dateSplits[1] }.${ dateSplits[2] }`;
        d.push(dateStr);
      });
      setHighest(h);
      setLowest(l);
      SetDates(() => d);
    });
  }

  const handleSearchCity = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!value) {
      setFilter([]);
      return;
    }
    const filtered = cities.filter((item) => item.city.includes(value));
    if (filtered.length) {
      setFilter(filtered);
    } else {
      setFilter([]);
    }
  };

  return (
    <div className='App'>
      <div className='main'>
        <div className={ 'search-city' }>
          <input type='text' onChange={ debounce(handleSearchCity) } />
          { displayFilter }
        </div>
        <div className={ 'weather-info' }>
          <p className={ 'city-row' }>
            <span className={ 'city' }>当前城市：{ city.city }</span>
          </p>
          <p className={ 'temp-row' }>
            <span className={ 'temp-highest' }>今日最高温：{ weatherInfo.tem_day }℃</span>
            <span className={ 'temp-lowest' }>今日最低温：{ weatherInfo.tem_night }℃</span>
          </p>
          <p className={ 'weather-row' }>
            <span className={ 'weather' }>今日天气：{ weatherInfo.wea }</span>
          </p>
          <p className={ 'wind-row' }>
            <span className={ 'wind' }>今日风向：{ weatherInfo.win }</span>
            <span className={ 'wind-speed' }>今日风力：{ weatherInfo.win_speed }</span>
          </p>
        </div>

      </div>
      <div
        ref={ container }
        className={ 'chart' }
        id='container'
        style={ { width: '700px', height: '400px' } }
      ></div>
      <span className={ 'update-button' } onClick={ () => refresh() }>Update</span>
    </div>
  );
}

export default App;

