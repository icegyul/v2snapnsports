import type {
  AppDataState,
  SafeError,
  VideoAssetView,
} from './contracts';

export interface VideoRemoteState {
  state: AppDataState;
  updatedAt?: string;
  error?: SafeError;
  onRetry?: () => void;
}

export interface VideoHomeProps extends VideoRemoteState {
  representative?: VideoAssetView;
  recent: VideoAssetView[];
  onOpenLibrary: () => void;
  onOpenVideo: (videoId: string) => void;
}

export interface VideoLibraryProps extends VideoRemoteState {
  items: VideoAssetView[];
  nextCursor?: string;
  filter: 'ALL_VISIBLE' | 'MY_VIDEOS' | 'TEAM' | 'CAREER';
  onFilterChange: (filter: 'ALL_VISIBLE' | 'MY_VIDEOS' | 'TEAM' | 'CAREER') => void;
  onOpenVideo: (videoId: string) => void;
  onLoadMore?: () => void;
}

export interface VideoDetailProps extends VideoRemoteState {
  video: VideoAssetView | null;
  onSetRepresentative: () => void;
  onOpenCareerPassport: () => void;
  onReport?: () => void;
}

export interface RepresentativeVideoSelectorProps {
  candidates: VideoAssetView[];
  selectedVideoId?: string;
  saving: boolean;
  onSelect: (videoId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface VideoPermissionDeniedProps {
  genericMessage: string;
  onBack: () => void;
}

export interface VideoEmptyStateProps {
  kind: 'NO_VISIBLE_VIDEO' | 'NO_MY_VIDEO' | 'NO_REPRESENTATIVE_VIDEO';
  onBack?: () => void;
}
