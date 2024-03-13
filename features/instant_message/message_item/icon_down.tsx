// eslint-disable-next-line react/require-default-props
const IconDown = function ({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return <img src={active ? '/down_pressed.svg' : '/down_default.svg'} width={size} alt="아래로 내려간 화살표" />;
};

export default IconDown;
