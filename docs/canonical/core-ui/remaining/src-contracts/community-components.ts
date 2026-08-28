import type {
  AppDataState,
  CommunityComment,
  CommunityContentType,
  CommunityPost,
  CommunityPostDetail,
  CommunityVisibility,
  SafeError,
} from './contracts';

export interface CommunityRemoteState {
  state: AppDataState;
  staleAt?: string;
  updatedAt?: string;
  error?: SafeError;
  onRetry?: () => void;
}

export interface CommunityHomeProps extends CommunityRemoteState {
  items: CommunityPost[];
  nextCursor?: string;
  activeType?: CommunityContentType | 'ALL';
  canCreate: boolean;
  onOpenPost: (postId: string) => void;
  onCreate: () => void;
  onChangeType: (type: CommunityContentType | 'ALL') => void;
  onLoadMore?: () => void;
}

export interface CommunityPostCardProps {
  post: CommunityPost;
  onOpen: (postId: string) => void;
  onLikeToggle?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onBlockAuthor?: (authorUserId: string) => void;
}

export interface CommunityPostDetailProps extends CommunityRemoteState {
  detail: CommunityPostDetail | null;
  onLikeToggle: () => void;
  onSubmitComment: (body: string) => void;
  onOpenReport: (target: { type: 'POST' | 'COMMENT'; id: string }) => void;
  onBlockAuthor: () => void;
}

export interface CommunityCommentSectionProps {
  comments: CommunityComment[];
  canComment: boolean;
  draft: string;
  submitting: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onReportComment: (commentId: string) => void;
  onBlockCommentAuthor: (commentId: string) => void;
}

export interface CommunityComposerDraft {
  type: CommunityContentType;
  title?: string;
  body: string;
  visibility: CommunityVisibility;
  organizationId?: string;
  teamId?: string;
  mediaAssetIds: string[];
  localDraftUpdatedAt?: string;
}

export interface CommunityComposerProps extends CommunityRemoteState {
  draft: CommunityComposerDraft;
  allowedVisibilities: CommunityVisibility[];
  saving: boolean;
  submitting: boolean;
  onChange: (draft: CommunityComposerDraft) => void;
  onSaveLocalDraft: () => void;
  onDiscardLocalDraft: () => void;
  onSubmit: () => void;
}

export interface CommunityReportFlowProps {
  open: boolean;
  target: { type: 'POST' | 'COMMENT' | 'USER'; id: string } | null;
  reasonCode?: string;
  details?: string;
  submitting: boolean;
  onReasonChange: (reasonCode: string) => void;
  onDetailsChange: (details: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface CommunityBlockConfirmationProps {
  open: boolean;
  safeUserLabel: string;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface CommunityHiddenStateProps {
  moderationState: 'UNDER_REVIEW' | 'HIDDEN' | 'REMOVED';
  reasonLabel: string;
  canAppealOrReview: boolean;
  onReviewAction?: () => void;
}

export interface CommunityEmptyStateProps {
  kind: 'NO_POSTS' | 'FILTER_EMPTY' | 'NO_VISIBLE_POSTS';
  canCreate: boolean;
  onCreate?: () => void;
}
