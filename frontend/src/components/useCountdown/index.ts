import { useEffect, useState } from 'react';
import moment from 'moment';

// 入参
export interface ICountdown {
  deadline: string;
  format?: 'YYYY-MM-DD HH:mm:ss' | string;
}
// 返回值
export type Remains = Record<'day' | 'hour' | 'minute' | 'second', number>;

const useCountdown = ({
  deadline,
  format = 'YYYY-MM-DD HH:mm:ss',
}: ICountdown): Remains => {
  // 由于 moment() 返回对象，setCurrent 修改值后指针不变，无法在 useEffect 中捕获变化，所以这里定义了一个 updater 用于 useEffect 捕获时间更新
  const [{ current, updater }, setCurrent] = useState({
    current: moment(),
    updater: 0,
  });
  const [remains, setRemains] = useState<Remains>({
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  });
  useEffect(() => {
    const timer = window.setInterval(() => {
      current.isSameOrAfter(moment(deadline, format))
        ? clearInterval(timer)
        : setCurrent(prev => ({
            current: prev.current.add(1, 's'),
            updater: prev.updater + 1,
          }));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  // current 变化，计算相差多长时间
  useEffect(() => {
    let millisec = moment(deadline, format).valueOf() - current.valueOf();
    // 处理 millisec 可能为负数的情况
    millisec = millisec >= 0 ? millisec : 0;
    // 用毫秒数得到秒、分、小时和天
    setRemains({
      day: Math.floor(millisec / (1000 * 60 * 60 * 24)),
      hour: Math.floor((millisec / (1000 * 60 * 60)) % 24),
      minute: Math.floor((millisec / (1000 * 60)) % 60),
      second: Math.round((millisec / 1000) % 60),
    });
  }, [updater]);

  return remains;
};

export default useCountdown;