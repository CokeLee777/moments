import type { CSSProperties } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  children: string;
  fontSize: number;
  color: string;
  lineHeight: number;
  numberOfLines?: number;
  boldColor?: string;
  marginTop?: number;
}

export function MarkdownText({
  children,
  fontSize,
  color,
  lineHeight,
  numberOfLines,
  boldColor,
  marginTop,
}: Props) {
  const clampStyle: CSSProperties = numberOfLines
    ? {
        overflow: 'hidden',
        display: '-webkit-box' as CSSProperties['display'],
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical' as CSSProperties['WebkitBoxOrient'],
      }
    : {};

  return (
    <div style={{ fontSize, color, lineHeight: `${lineHeight}px`, marginTop, ...clampStyle }}>
      <ReactMarkdown
        components={{
          // 클램핑 모드: p를 인라인 span으로 렌더링해야 line-clamp가 정상 동작
          // 전체 보기: 단락 간격 유지
          p: numberOfLines
            ? ({ children: c }) => <span>{c}</span>
            : ({ children: c }) => <p style={{ margin: '0 0 6px 0', padding: 0 }}>{c}</p>,
          strong: ({ children: c }) => (
            <strong style={{ fontWeight: 'bold', color: boldColor ?? 'inherit' }}>{c}</strong>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
