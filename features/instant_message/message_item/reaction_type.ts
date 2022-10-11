export type REACTION_TYPE = 'LIKE' | 'NEXT' | 'HAHA' | 'EYE' | 'CHEERUP';

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
  LIKE: '/reaction_heart.gif',
  NEXT: '/reaction_confuse.gif',
  HAHA: '/reaction_haha.gif',
  EYE: '/reaction_donggong.gif',
  CHEERUP: '/reaction_todak.gif',
};

const TYPE_TO_TITLE: ReactionTypeToImage = {
  LIKE: '공감해요',
  NEXT: '다르게 생각해요',
  HAHA: 'ㅋㅋㅋㅋ',
  EYE: '동공지진',
  CHEERUP: '토닥토닥',
};

const REACTION: ReactionItem[] = [
  {
    image: TYPE_TO_IMAGE.LIKE,
    bg: '#fff',
    index: 5,
    title: TYPE_TO_TITLE.LIKE,
    type: 'LIKE',
  },
  {
    image: TYPE_TO_IMAGE.NEXT,
    bg: '#fff',
    index: 5,
    title: TYPE_TO_TITLE.NEXT,
    type: 'NEXT',
  },
  {
    image: TYPE_TO_IMAGE.HAHA,
    bg: '#fff',
    index: 5,
    title: TYPE_TO_TITLE.HAHA,
    type: 'HAHA',
  },
  {
    image: TYPE_TO_IMAGE.EYE,
    bg: '#fff',
    index: 5,
    title: TYPE_TO_TITLE.EYE,
    type: 'EYE',
  },
  {
    image: TYPE_TO_IMAGE.CHEERUP,
    bg: '#fff',
    index: 5,
    title: TYPE_TO_TITLE.CHEERUP,
    type: 'CHEERUP',
  },
];

const ReactionConst = {
  REACTION,
  TYPE_TO_IMAGE,
  TYPE_TO_TITLE,
};

export default ReactionConst;
