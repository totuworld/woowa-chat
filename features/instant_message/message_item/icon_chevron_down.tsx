// eslint-disable-next-line react/require-default-props
const IconChevronDown = function ({ color = '#000', size = 24 }: { color?: string; size?: number }) {
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
      <path d="M5.00002 7.26758H19C19.3986 7.26758 19.7592 7.5043 19.9176 7.87005C20.0761 8.2358 20.0022 8.66073 19.7296 8.95152L12.7296 16.4182C12.5405 16.6198 12.2764 16.7342 12 16.7342C11.7236 16.7342 11.4595 16.6198 11.2705 16.4182L4.27049 8.95152C3.99787 8.66073 3.92398 8.2358 4.08243 7.87005C4.24089 7.5043 4.60142 7.26758 5.00002 7.26758Z" />
    </svg>
  );
};

export default IconChevronDown;
