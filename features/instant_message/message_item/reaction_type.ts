export type REACTION_TYPE = 'LIKE' | 'CARE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' | 'DOWN';

interface ReactionItem {
  image: string;
  bg: string;
  index: number;
  title: string;
  type: REACTION_TYPE;
}

interface ReactionTypeToImage {
  [key: string]: string;
}

const TYPE_TO_IMAGE: ReactionTypeToImage = {
  LIKE: '/reaction_question.gif',
  CARE: '/reaction_care.png',
  HAHA: '/reaction_haha.png',
  WOW: '/reaction_wow.png',
  SAD: '/reaction_sad.png',
  ANGRY: '/reaction_angry.png',
  DOWN: '/reaction_haha.png',
};

const TYPE_TO_TITLE: ReactionTypeToImage = {
  LIKE: '우수타에서 다뤄주세요',
  // CARE: '힘내요',
  // HAHA: '웃겨요',
  // WOW: '멋져요',
  // SAD: '슬퍼요',
  // ANGRY: '화나요',
  DOWN: '꼭 다루지 않아도 될 것 같아요',
};

const REACTION: ReactionItem[] = [
  {
    image: TYPE_TO_IMAGE.LIKE,
    bg: '#fff',
    index: 5,
    title: TYPE_TO_TITLE.LIKE,
    type: 'LIKE',
  },
  // {
  //   image: TYPE_TO_IMAGE.CARE,
  //   bg: '#fff',
  //   index: 5,
  //   title: TYPE_TO_TITLE.CARE,
  //   type: 'CARE',
  // },
  // {
  //   image: TYPE_TO_IMAGE.HAHA,
  //   bg: '#fff',
  //   index: 5,
  //   title: TYPE_TO_TITLE.HAHA,
  //   type: 'HAHA',
  // },
  // {
  //   image: TYPE_TO_IMAGE.WOW,
  //   bg: '#fff',
  //   index: 5,
  //   title: TYPE_TO_TITLE.WOW,
  //   type: 'WOW',
  // },
  // {
  //   image: TYPE_TO_IMAGE.SAD,
  //   bg: '#fff',
  //   index: 5,
  //   title: TYPE_TO_TITLE.SAD,
  //   type: 'SAD',
  // },
  // {
  //   image: TYPE_TO_IMAGE.ANGRY,
  //   bg: '#fff',
  //   index: 5,
  //   title: TYPE_TO_TITLE.ANGRY,
  //   type: 'ANGRY',
  // },
];

const ReactionConst = {
  REACTION,
  TYPE_TO_IMAGE,
  TYPE_TO_TITLE,
};

export default ReactionConst;
