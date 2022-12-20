import styled, { css } from 'styled-components';
import { useMemo } from 'react';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import ReactionConst, { REACTION_TYPE } from './reaction_type';

const Selector = styled.div`
  background-color: #fff;
  border-radius: 50px;
  padding: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.15);
  display: flex;
`;

const ReactionIcon = styled.div<{ iconSize: number }>`
  ${({ iconSize }) => css`
    width: ${iconSize + 10}px;
  `}
`;

const ReactionLabel = styled.div`
  position: absolute;
  word-break: keep-all;
  top: -22px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 14px;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 7px 3px;
  left: 50%;
  transform: translateX(-50%);
  transition: 200ms transform cubic-bezier(0.23, 1, 0.32, 1);
  opacity: 0;
  z-index: 1;
`;

const ReactionIconWrap = styled.div`
  padding: 5px;
  position: relative;
  &:hover {
    ${ReactionLabel} {
      transform: translateX(-50%) translateY(-10px);
      opacity: 1;
    }
  }
`;

const ReactionIconImg = styled.div<{ url: string; selected: boolean }>`
  padding-bottom: 100%;
  background-image: url(${({ url }) => url});
  background-size: 100% 100%;
  transform-origin: bottom;
  cursor: pointer;

  transition: 200ms transform cubic-bezier(0.23, 1, 0.32, 1);
  &:hover {
    transform: scale(1.3);
  }
  ::after {
    ${({ selected }) => {
      if (selected === false) return;
      return css`
        content: '';
        position: absolute;
        border: 2px solid rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        width: 32px;
        height: 32px;
      `;
    }}
  }
`;

const ReactionCount = styled.div`
  position: absolute;
  word-break: keep-all;
  top: 22px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 14px;
  color: #fff;
  font-size: 9px;
  font-weight: 500;
  padding: 4px 7px 3px;
  right: -12px;
  transform: translateX(-50%);
`;

interface Props {
  onClickReaction: (type: REACTION_TYPE) => void;
  // eslint-disable-next-line react/require-default-props
  showCount?: boolean;
  reaction: InInstantEventMessage['reaction'];
}

const ReactionEmojiSelector = function ({ onClickReaction, showCount = false, reaction = [] }: Props) {
  const memoReduceReactionCount = useMemo(() => {
    if (reaction === undefined)
      return {
        LIKE: 0,
        CARE: 0,
        HAHA: 0,
        WOW: 0,
        SAD: 0,
        ANGRY: 0,
      };
    return reaction.reduce(
      (acc, cur) => {
        acc[cur.type] += 1;
        return acc;
      },
      {
        LIKE: 0,
        CARE: 0,
        HAHA: 0,
        WOW: 0,
        SAD: 0,
        ANGRY: 0,
      },
    );
  }, [reaction]);
  return (
    <Selector>
      {ReactionConst.REACTION.map((iconData) => {
        const selected = reaction.findIndex((fv) => fv.type === iconData.type && fv.voter !== '') > -1;
        return (
          <ReactionIcon
            iconSize={32}
            key={`${iconData.index}`}
            onClick={() => {
              if (showCount) return;
              onClickReaction(iconData.type);
            }}
          >
            <ReactionIconWrap>
              <ReactionLabel>{iconData.title}</ReactionLabel>
              <ReactionIconImg url={iconData.image} selected={selected} />
              {showCount && <ReactionCount>{memoReduceReactionCount[iconData.type]}</ReactionCount>}
            </ReactionIconWrap>
          </ReactionIcon>
        );
      })}
    </Selector>
  );
};

export default ReactionEmojiSelector;
