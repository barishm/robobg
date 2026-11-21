import { useEffect, useState } from 'react';

const RELATIVE_TIME_REFRESH_MS = 30000;
const LINK_IMAGE_MAX_WIDTH = 1000;

export const OFFERS_PER_PAGE = 10;
export const EMPTY_LINK = { title: '', url: '', image: '' };

export const normalizeUrl = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const hostnameOf = (url) => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// Shrinks big photos before upload (the backend resizes too, but this keeps
// the request small) and gives a data URL for the preview.
export const readLinkImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, LINK_IMAGE_MAX_WIDTH / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

export const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

const bgUnit = (count, singular, plural) => `преди ${count} ${count === 1 ? singular : plural}`;
const enUnit = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

export const formatRelativeTime = (iso, lang) => {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));

  if (diffSec < 5) {
    return lang === 'en' ? 'just now' : 'току-що';
  }
  if (diffSec < 60) {
    return lang === 'en' ? enUnit(diffSec, 'second') : bgUnit(diffSec, 'секунда', 'секунди');
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return lang === 'en' ? enUnit(diffMin, 'minute') : bgUnit(diffMin, 'минута', 'минути');
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return lang === 'en' ? enUnit(diffHour, 'hour') : bgUnit(diffHour, 'час', 'часа');
  }
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return lang === 'en' ? enUnit(diffDay, 'day') : bgUnit(diffDay, 'ден', 'дни');
  }

  return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Re-renders periodically to keep "X minutes ago" timestamps fresh without
// needing a refresh.
export const useRelativeTimeTick = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => setTick((tick) => tick + 1), RELATIVE_TIME_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);
};
