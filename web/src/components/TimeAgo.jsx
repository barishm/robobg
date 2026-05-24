import React, { useEffect, useState } from 'react';

const TimeAgo = ({ createTime }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const createdTime = new Date(createTime);
      const timeDifference = now - createdTime;

      if (timeDifference < 1000) {
        setTimeAgo('now');
      } else {
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(timeDifference / (1000 * 60));
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
        const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

        if (seconds < 60) {
          setTimeAgo(`${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`);
        } else if (minutes < 60) {
          setTimeAgo(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`);
        } else if (hours < 24) {
          setTimeAgo(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
        } else if (days < 30) {
          setTimeAgo(`${days} ${days === 1 ? 'day' : 'days'} ago`);
        } else if (months < 12) {
          setTimeAgo(`${months} ${months === 1 ? 'month' : 'months'} ago`);
        } else {
          setTimeAgo(`${years} ${years === 1 ? 'year' : 'years'} ago`);
        }
      }
    };

    calculateTimeAgo();
    const intervalId = setInterval(calculateTimeAgo, 60000);

    return () => clearInterval(intervalId);
  }, [createTime]);

  return <span style={{ fontSize: '14px' }}>&nbsp;{timeAgo}</span>;
};

export default TimeAgo;