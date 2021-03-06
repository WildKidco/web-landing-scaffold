import { trackEvent } from 'common/lib/analytics';
import React from 'react';
import watermark from '../../art/watermark.svg';
import styles from '../../styles.module.scss';
import CaptureButton from './CaptureButton';
import ClearButton from './ClearButton';
import ColoringBookLayer from './ColoringBookLayer';
import DrawingLayer from './DrawingLayer';
import VideoLayer from './VideoLayer';
import YouAreHere from './YouAreHere';

const FILE_FORMAT = 'image/png';
const FILE_NAME = 'your-easel-artwork.png';
const FILE_DIMENSION = 500; //Default -- Tries to use

/**
 * Workaround for browsers that can't set Filenames for Globs
 * Creating an anchor tag for the image triggers a downlaod with a filename
 * @param {HTMLCanvasElement.toDataURL} fileContents
 * @param {String} fileName
 */
function handleDownload(fileContents, fileName = FILE_NAME) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = fileContents;
  link.click();

  return true;
}

const drawSVG = ({ ctx, svg, width, height, x = 0, y = 0 }) => {
  return new Promise((resolve, reject) => {
    // Draw SVG Sketch into Canvas
    const img = new Image();
    img.width = width;
    img.height = height;
    img.style.position = 'absolute';
    img.style.zIndex = '-1';
    img.style.top = '-100vh';
    img.style.left = '-100vw';
    img.onload = function() {
      ctx.drawImage(img, x, y, width, height);
      resolve(ctx);
    };
    img.src =
      typeof svg === 'string'
        ? svg
        : `data:image/svg+xml;utf8,${svg.outerHTML}`;

    // Append image to DOM to trigger load event
    // Some browsers weren't loading the image without this
    document.body.appendChild(img);
    img.remove();
  });
};

function handleCapture(video, drawing, coloringBook) {
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  // Video orientation
  const orientation = video
    ? video.videoWidth < video.videoHeight
      ? 'portrait'
      : 'landscape'
    : 'landscape';
  // Video short side is size of square/circle
  const size = FILE_DIMENSION;

  canvas.width = size;
  canvas.height = size;
  // Draw Video into Canvas
  video &&
    ctx.drawImage(
      video,
      orientation === 'landscape' ? video.videoWidth / 2 - size / 2 : 0,
      orientation === 'portrait' ? video.videoHeight / 2 - size / 2 : 0,
      size,
      size,
      0,
      0,
      size,
      size
    );

  // Draw Drawing into Canvas
  drawSVG({
    ctx,
    svg: drawing,
    width: size,
    height: size,
  }).then((ctx) => {
    // Add Coloring Book
    coloringBook && ctx.drawImage(coloringBook, 0, 0, size, size);

    // Add Easel Watermark
    drawSVG({
      ctx,
      svg: watermark,
      width: 82,
      height: 25,
      y: size - 25 - 40,
      x: size / 2 - 82 / 2,
    }).then((ctx) => {
      // Mask Canvas into Circle
      // Change Composite behavior to only draw image where mask is
      ctx.globalCompositeOperation = 'destination-in';

      // Creat Circle Mask
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(
        size * 0.5, // x
        size * 0.5, // y
        size * 0.48, // radius
        0, // start angle
        2 * Math.PI // end angle
      );
      ctx.fill();

      // Restore to default composite operation (is draw over current image)
      ctx.globalCompositeOperation = 'source-over';

      // Create Border / Stroke around circle
      // const gradient = ctx.createLinearGradient(0, 0, size, 0);
      // gradient.addColorStop('0', 'magenta');
      // gradient.addColorStop('0.5', 'blue');
      // gradient.addColorStop('1.0', 'red');

      const strokeWeight = 20;

      ctx.beginPath();
      ctx.arc(
        size * 0.5, // x
        size * 0.5, // y
        size * 0.5 - strokeWeight, // radius
        0, // start angle
        2 * Math.PI // end angle
      );
      ctx.lineWidth = strokeWeight;
      // ctx.strokeStyle = gradient;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      handleDownload(
        canvas.toDataURL(FILE_FORMAT).replace(FILE_FORMAT, 'image/octet-stream')
      );
    });
  });
}

/**
 * @link Responsive Video: https://blog.logrocket.com/responsive-camera-component-react-hooks/
 */
export default function Workspace({ release, size }) {
  const [supportsVideo, setSupportsVideo] = React.useState(true);
  const [clearWorkspace, setClearWorkspace] = React.useState(false);
  const videoRef = React.useRef();
  const drawRef = React.useRef();
  const cbRef = React.useRef();

  React.useEffect(() => {
    clearWorkspace && setClearWorkspace(false);
  }, [clearWorkspace]);

  return (
    <div className={styles.Workspace}>
      <YouAreHere />
      <VideoLayer
        ref={videoRef}
        handleIsEnabled={() => {
          trackEvent('easel:video:enabled', { release });
          setSupportsVideo(true);
        }}
        handleIsDisabled={() => {
          trackEvent('easel:video:disabled', { release });
          setSupportsVideo(false);
        }}
      />
      <DrawingLayer ref={drawRef} reset={clearWorkspace} />
      <ColoringBookLayer
        ref={cbRef}
        hide={false && supportsVideo} // Note: Remove `false &&` to anchor coloring book to non-video experience
        reset={clearWorkspace}
      />
      <CaptureButton
        onClick={() => {
          trackEvent('easel:click:download', { release });
          handleCapture(videoRef.current, drawRef.current, cbRef.current);
        }}
      />
      <ClearButton
        onClick={() => {
          trackEvent('easel:click:clear', { release });
          setClearWorkspace(true);
        }}
      />
    </div>
  );
}
