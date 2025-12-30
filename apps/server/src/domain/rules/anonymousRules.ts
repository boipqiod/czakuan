// 익명 ID 생성
export function generateAnonymousId(sequence: number): string {
  return `익명${sequence}`;
}

// 다음 익명 ID 시퀀스 계산
export function getNextAnonymousSequence(existingIds: string[]): number {
  if (existingIds.length === 0) return 1;

  const sequences = existingIds
    .map((id) => {
      const match = id.match(/^익명(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
}

// 익명 게시판 기본 프로필 이미지
export function getAnonymousProfileImage(): string {
  return "/images/anonymous-profile.png";
}
