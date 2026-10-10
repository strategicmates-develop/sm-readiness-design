// Brand graphic pattern: a corner cluster of chessboard squares with rounded
// points (radius 15% of the side), staggered along the diagonal. Pure decoration.
// The cluster is drawn in a 3x3 grid and anchored to the bottom-right corner;
// `flipX` / `flipY` move it to another corner. Squares are 20px on mobile and
// 28px from md up.
import PropTypes from 'prop-types';

// Checkerboard cells of the 3x3 grid; `strong` squares take the higher opacity.
const SQUARES = [
  { x: 0, y: 0, strong: false },
  { x: 2, y: 0, strong: false },
  { x: 1, y: 1, strong: true },
  { x: 0, y: 2, strong: false },
  { x: 2, y: 2, strong: true },
];

const SQUARE_RADIUS = 0.15;

// `color` is the fill; `opacity` overrides the 30% / 70% pair with one value.
export default function Escaques({ color = '#5f96b5', opacity, flipX = false, flipY = false, className = '' }) {
  const flip = `${flipX ? '-scale-x-100' : ''} ${flipY ? '-scale-y-100' : ''}`;
  return (
    <svg
      viewBox="0 0 3 3"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none h-[60px] w-[60px] shrink-0 md:h-[84px] md:w-[84px] ${flip} ${className}`}
    >
      {SQUARES.map(({ x, y, strong }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="1"
          height="1"
          rx={SQUARE_RADIUS}
          fill={color}
          fillOpacity={opacity ?? (strong ? 0.7 : 0.3)}
        />
      ))}
    </svg>
  );
}

Escaques.propTypes = {
  color: PropTypes.string,
  opacity: PropTypes.number,
  flipX: PropTypes.bool,
  flipY: PropTypes.bool,
  className: PropTypes.string,
};
