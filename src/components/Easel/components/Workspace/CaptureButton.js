import cx from 'classnames';
import React from 'react';
import styles from '../../styles.module.scss';

export default function CaptureButton({ onClick }) {
  return (
    <svg
      onClick={onClick}
      className={cx(styles.WorkspaceCaptureButton)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 71 71"
    >
      <title>💾 Save Your Creation!</title>
      <rect
        width="68"
        height="68"
        x="1.5"
        y="1.5"
        fill="#A2D2FF"
        stroke="#fff"
        strokeWidth="3"
        rx="34"
      />
      <rect
        width="41.862"
        height="22"
        x="14"
        y="25"
        fill="#FF8A00"
        stroke="#fff"
        strokeWidth="2"
        rx="1.483"
      />
      <circle
        cx="34.931"
        cy="36"
        r="5.207"
        fill="#FF8A00"
        stroke="#fff"
        strokeWidth="2"
      />
      <rect
        width="4.966"
        height="3.31"
        x="46.517"
        y="28.552"
        fill="#fff"
        stroke="#FF8A00"
        strokeWidth=".828"
        rx=".414"
      />
    </svg>
  );
}
