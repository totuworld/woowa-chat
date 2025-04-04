// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import MemberModel from '@/features/member/member.model';
import { requester } from '@/utils/requester';

const SIZE = 20;

interface DivisionInfo {
  id: string;
  email: string;
  name: string;
  group: {
    full: string;
  };
}

interface UpdateResult {
  processedCount: number;
  updatedCount: number;
}

async function processMembers(lastVisible: any = null): Promise<UpdateResult> {
  // MemberModel.getMembersWithPagination 이용해서 SIZE 만큼 멤버를 가져온다.
  const memberResp = await MemberModel.getMembersWithPagination(SIZE, lastVisible);
  const { members, hasMore, lastVisible: nextLastVisible } = memberResp;

  if (members.length === 0) {
    return { processedCount: 0, updatedCount: 0 };
  }

  // 이메일 목록 추출
  const emailParams = members
    .filter((mv) => mv.email !== null)
    .map((member) => `emails=${encodeURIComponent(member.email!)}`)
    .join('&');

  // Workflow API 호출
  const response = await requester<{ data: DivisionInfo[] }>({
    option: { url: `https://workflow-api.woowa.in/members/anniversary?${emailParams}` },
  });

  if (response.status !== 200 || response.payload === undefined) {
    console.warn('Workflow API 호출 실패 또는 데이터 없음:', response.status);
    // 실패해도 다음 배치를 계속 처리하기 위해 하위 배치 처리 결과를 반환
    return hasMore ? processMembers(nextLastVisible) : { processedCount: members.length, updatedCount: 0 };
  }

  const updates: { uid: string; name: string; email: string; division: string | null; center: string | null }[] = [];

  response.payload.data.forEach((memberData) => {
    const { name, email, group } = memberData;
    // group.full에서 부문과 센터 정보 추출
    if (group && group.full) {
      const fullGroupText = group.full;
      // 정규표현식을 사용해서 부문과 센터 정보 추출
      let division = null;
      let center = null;

      // "부문"으로 끝나는 단어 찾기
      const divisionMatch = fullGroupText.match(/([^/]+부문)/);
      if (divisionMatch) {
        division = divisionMatch[0].trim();
      }

      // "센터"로 끝나는 단어 찾기
      const centerMatch = fullGroupText.match(/([^/]+센터)/);
      if (centerMatch) {
        center = centerMatch[0].trim();
      }

      if (division || center) {
        const member = members.find((mv) => mv.email === email);
        if (member) {
          updates.push({
            uid: member.uid,
            name,
            email,
            division,
            center,
          });
        }
      }
    }
  });

  // 업데이트 처리
  await Promise.all(
    updates.map(async (mv) => {
      const updateValue: { displayName: string; division: string | null; center: string | null } = {
        displayName: mv.name,
        division: mv.division !== undefined && mv.division !== null ? mv.division : null,
        center: mv.center !== undefined && mv.center !== null ? mv.center : null,
      };
      await MemberModel.update({ uid: mv.uid, data: updateValue });
    }),
  );

  const currentResult = {
    processedCount: members.length,
    updatedCount: updates.length,
  };

  // 더 처리할 회원이 있으면 재귀적으로 처리
  if (hasMore) {
    const nextResult = await processMembers(nextLastVisible);
    return {
      processedCount: currentResult.processedCount + nextResult.processedCount,
      updatedCount: currentResult.updatedCount + nextResult.updatedCount,
    };
  }

  return currentResult;
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await processMembers();

    return res.status(200).json({
      message: '회원 부문/센터 정보 업데이트 완료',
      processedCount: result.processedCount,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error('부문/센터 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
