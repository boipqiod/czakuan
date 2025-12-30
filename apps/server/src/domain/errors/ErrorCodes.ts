export const ErrorCodes = {
  // Auth (1xxx)
  AUTH_INVALID_TOKEN: { code: "AUTH_001", status: 401, message: "유효하지 않은 토큰입니다." },
  AUTH_EXPIRED_TOKEN: { code: "AUTH_002", status: 401, message: "토큰이 만료되었습니다." },
  AUTH_REQUIRED: { code: "AUTH_003", status: 401, message: "로그인이 필요합니다." },
  AUTH_FORBIDDEN: { code: "AUTH_004", status: 403, message: "권한이 없습니다." },
  AUTH_KAKAO_FAILED: { code: "AUTH_005", status: 400, message: "카카오 인증에 실패했습니다." },

  // User (2xxx)
  USER_NOT_FOUND: { code: "USER_001", status: 404, message: "사용자를 찾을 수 없습니다." },
  USER_DUPLICATE_NICKNAME: { code: "USER_002", status: 409, message: "이미 사용 중인 닉네임입니다." },
  USER_INVALID_NICKNAME: { code: "USER_003", status: 400, message: "유효하지 않은 닉네임입니다." },

  // Post (3xxx)
  POST_NOT_FOUND: { code: "POST_001", status: 404, message: "게시글을 찾을 수 없습니다." },
  POST_ALREADY_DELETED: { code: "POST_002", status: 410, message: "이미 삭제된 게시글입니다." },
  POST_FORBIDDEN: { code: "POST_003", status: 403, message: "게시글 권한이 없습니다." },
  POST_INVALID_TITLE: { code: "POST_004", status: 400, message: "유효하지 않은 제목입니다." },
  POST_INVALID_CONTENT: { code: "POST_005", status: 400, message: "유효하지 않은 내용입니다." },

  // Comment (4xxx)
  COMMENT_NOT_FOUND: { code: "CMT_001", status: 404, message: "댓글을 찾을 수 없습니다." },
  COMMENT_ALREADY_DELETED: { code: "CMT_002", status: 410, message: "이미 삭제된 댓글입니다." },
  COMMENT_FORBIDDEN: { code: "CMT_003", status: 403, message: "댓글 권한이 없습니다." },
  COMMENT_INVALID_CONTENT: { code: "CMT_004", status: 400, message: "유효하지 않은 댓글 내용입니다." },

  // Category (5xxx)
  CATEGORY_NOT_FOUND: { code: "CAT_001", status: 404, message: "카테고리를 찾을 수 없습니다." },
  CATEGORY_INACTIVE: { code: "CAT_002", status: 400, message: "비활성화된 카테고리입니다." },

  // Reaction (6xxx)
  ALREADY_REPORTED: { code: "RCT_001", status: 409, message: "이미 신고한 게시글/댓글입니다." },
  CANNOT_REPORT_OWN: { code: "RCT_002", status: 400, message: "본인 글/댓글은 신고할 수 없습니다." },
  REPORT_REASON_REQUIRED: { code: "RCT_003", status: 400, message: "신고 사유를 입력해주세요." },

  // Validation (9xxx)
  VALIDATION_ERROR: { code: "VAL_001", status: 400, message: "입력값이 올바르지 않습니다." },
  INTERNAL_ERROR: { code: "ERR_001", status: 500, message: "서버 오류가 발생했습니다." },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;
export type ErrorCodeValue = (typeof ErrorCodes)[ErrorCodeKey];
