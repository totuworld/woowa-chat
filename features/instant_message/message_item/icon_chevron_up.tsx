// eslint-disable-next-line react/require-default-props
const IconChevronUp = function ({ color = '#000', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-hidden="true"
      style={{
        fill: color,
        flexShrink: 0,
      }}
    >
      <path d="M5.00002 16.7323C4.60142 16.7323 4.24089 16.4956 4.08243 16.1298C3.92398 15.7641 3.99787 15.3391 4.27049 15.0484L11.2705 7.58168C11.4595 7.38003 11.7236 7.26562 12 7.26562C12.2764 7.26562 12.5405 7.38003 12.7296 7.58168L19.7296 15.0484C20.0022 15.3391 20.0761 15.7641 19.9176 16.1298C19.7592 16.4956 19.3986 16.7323 19 16.7323H5.00002Z" />
    </svg>
  );
};

export default IconChevronUp;
