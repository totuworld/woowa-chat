// eslint-disable-next-line react/require-default-props
const IconHeart = function ({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return <img src={active ? '/heart_pressed.svg' : '/heart_default.svg'} width={size} alt="하트 모양" />;
};

export default IconHeart;
