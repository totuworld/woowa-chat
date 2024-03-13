// eslint-disable-next-line react/require-default-props
const IconUp = function ({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return <img src={active ? '/up_pressed.svg' : '/up_default.svg'} width={size} alt="위로 올라간 화살표" />;
};

export default IconUp;
