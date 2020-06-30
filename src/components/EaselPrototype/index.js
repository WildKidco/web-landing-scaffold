import React from 'react';
import content from './images/easel-animation.gif';
import styles from './styles.module.scss';

export default function EaselPrototype() {
  return (
    <div className={styles.EaselPrototype}>
      <img alt="Experience The Easel" src={content} />
    </div>
  );
}
