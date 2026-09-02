import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, Bookmark, Bug, Database, Eye, ExternalLink, FlaskConical,
  Loader2, MessageCircleQuestion, Play, Search, ThumbsUp, X,
} from 'lucide-react';

// ─── 커뮤니티 — community_demo 백엔드 연동 ────────────────────────────────────
// 글 목록/추천/조회/즐겨찾기는 /api/community/* 를 실제로 호출한다.
// '실습해보기'는 글의 코드를 ai_set_demo/generated/에 스테이징하고 Web IDE로 이동.

const CATEGORIES = ['전체', '오류해결', '학습 결과', 'Q&A', '데이터 정보'];

// 카테고리별 커버 아이덴티티 (대표 이미지 — 시스템 그래머로 그린 커버)
const COVER = {
  '오류해결':   { icon: Bug,                   from: 'rgba(251,113,133,0.22)', to: 'rgba(251,113,133,0.04)', tint: '#fb7185' },
  '학습 결과':  { icon: FlaskConical,          from: 'rgba(74,222,155,0.20)',  to: 'rgba(74,222,155,0.04)',  tint: '#4ade9b' },
  'Q&A':        { icon: MessageCircleQuestion, from: 'rgba(91,120,255,0.22)',  to: 'rgba(91,120,255,0.04)',  tint: '#5b78ff' },
  '데이터 정보': { icon: Database,              from: 'rgba(232,179,75,0.22)',  to: 'rgba(232,179,75,0.05)',  tint: '#e8b34b' },
};

const CATEGORY_CHIP = {
  '오류해결': 'bg-ember/12 text-ember',
  '학습 결과': 'bg-mint/12 text-mint',
  'Q&A': 'bg-cobalt/12 text-cobalt',
  '데이터 정보': 'bg-gold/12 text-gold',
};

function Cover({ post }) {
  const c = COVER[post.category];
  const Icon = c.icon;
  return (
    <div
      className="h-28 rounded-xl border border-line flex flex-col items-center justify-center gap-2"
      style={{ background: `linear-gradient(150deg, ${c.from}, ${c.to} 70%)` }}
      aria-hidden="true"
    >
      <Icon className="w-7 h-7" style={{ color: c.tint }} />
      <span className="font-mono text-[10px] text-mist">#{post.tags[0]}</span>
    </div>
  );
}

function MetaCounts({ post, liked, bookmarked }) {
  return (
    <div className="flex items-center gap-3.5 font-mono text-[11px] text-mist tabular">
      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-dim" />{post.views.toLocaleString()}</span>
      <span className={`flex items-center gap-1 ${liked ? 'text-gold' : ''}`}><ThumbsUp className="w-3 h-3" />{post.likes.toLocaleString()}</span>
      <span className={`flex items-center gap-1 ${bookmarked ? 'text-gold' : ''}`}><Bookmark className="w-3 h-3" />{post.bookmarks.toLocaleString()}</span>
    </div>
  );
}

// ─── 글 상세 오버레이 ─────────────────────────────────────────────────────────
function PostDetail({ post, liked, bookmarked, onToggle, onPractice, practicing, onClose, onTag }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  // 열려 있는 동안 배경 스크롤을 잠그고, Tab 포커스를 다이얼로그 안에 가둔다
  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll('button:not([disabled]), a[href], input');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <article ref={dialogRef} role="dialog" aria-modal="true" aria-label={post.title} className="glass-card rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${CATEGORY_CHIP[post.category]}`}>
              {post.category}
            </span>
            <h2 className="mt-3 font-display font-bold text-xl leading-snug">{post.title}</h2>
            <p className="mt-2 font-mono text-[11px] text-dim">{post.author} · {post.created_at}</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="닫기" className="p-2 rounded-full text-mist hover:text-ink hover:bg-white/5 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Cover post={post} />

        <p className="mt-5 text-[14px] text-mist leading-relaxed">{post.content}</p>

        <div className="mt-4 flex items-center gap-1.5 flex-wrap">
          {post.tags.map((t) => (
            <button
              key={t}
              onClick={() => { onTag(t); onClose(); }}
              className="px-2.5 py-1 rounded-full bg-white/6 border border-line font-mono text-[11px] text-mist hover:text-ink hover:border-white/25 transition-colors"
            >
              #{t}
            </button>
          ))}
        </div>

        {post.practice_command && (
          <div className="mt-4 rounded-2xl bg-pit border border-line px-4 py-3 flex items-center gap-2.5 font-mono text-[12px]">
            <Play className="w-3.5 h-3.5 text-mint shrink-0" />
            <code className="text-ink truncate">{post.practice_command}</code>
          </div>
        )}

        {post.source && (
          <a
            href={post.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-2 text-[13px] text-cobalt hover:underline underline-offset-4"
          >
            <ExternalLink className="w-3.5 h-3.5" /> 출처: {post.source.name}
          </a>
        )}

        <div className="mt-6 pt-5 border-t border-line flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(post.id, liked ? 'unlike' : 'like')}
              aria-pressed={liked}
              className={`px-4 py-2 rounded-full border text-[13px] flex items-center gap-1.5 transition-colors ${
                liked ? 'border-gold/50 bg-gold/10 text-gold' : 'border-line text-mist hover:text-ink hover:border-white/25'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" /> 추천 {post.likes.toLocaleString()}
            </button>
            <button
              onClick={() => onToggle(post.id, bookmarked ? 'unbookmark' : 'bookmark')}
              aria-pressed={bookmarked}
              className={`px-4 py-2 rounded-full border text-[13px] flex items-center gap-1.5 transition-colors ${
                bookmarked ? 'border-gold/50 bg-gold/10 text-gold' : 'border-line text-mist hover:text-ink hover:border-white/25'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> 즐겨찾기 {post.bookmarks.toLocaleString()}
            </button>
          </div>
          {post.practice_available && (
            <button
              onClick={() => onPractice(post)}
              disabled={practicing}
              className="px-5 py-2 rounded-full bg-ink text-void text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {practicing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {post.category === '데이터 정보' ? '데이터 가져와서 실습' : '실습해보기'}
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

export default function Community({ go, onStaged, addToast }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('전체');
  const [sort, setSort] = useState('views'); // 'views' | 'latest'
  const [selected, setSelected] = useState(null); // post id
  const [liked, setLiked] = useState(() => new Set());
  const [bookmarked, setBookmarked] = useState(() => new Set());
  const [viewed, setViewed] = useState(() => new Set());
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    fetch('/api/community/posts')
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setError('API 서버에 연결할 수 없습니다. `python -m web_combine_demo.api_server`를 실행하세요.'));
  }, []);

  const patchPost = useCallback((id, counts) => {
    setPosts((prev) => prev?.map((p) => (p.id === id ? { ...p, ...counts } : p)));
  }, []);

  const interact = useCallback((id, action) => {
    fetch('/api/community/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id, action }),
    })
      .then((r) => r.json())
      .then((counts) => patchPost(id, counts))
      .catch(() => {});
  }, [patchPost]);

  const toggle = useCallback((id, action) => {
    interact(id, action);
    const [set, setter] = action.includes('like') && !action.includes('book')
      ? [liked, setLiked] : [bookmarked, setBookmarked];
    const next = new Set(set);
    if (action.startsWith('un')) next.delete(id); else next.add(id);
    setter(next);
  }, [interact, liked, bookmarked]);

  const openPost = useCallback((id) => {
    setSelected(id);
    if (!viewed.has(id)) {
      setViewed((prev) => new Set(prev).add(id));
      interact(id, 'view');
    }
  }, [viewed, interact]);

  const practice = useCallback((post) => {
    setPracticing(true);
    fetch('/api/community/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id }),
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.error) throw new Error(payload.error);
        onStaged?.(payload);
        addToast?.(`실습 코드가 준비되었습니다 — ${payload.script_path}`);
        setSelected(null);
        go('ide');
      })
      .catch((e) => addToast?.(`실습 준비 실패: ${e.message}`))
      .finally(() => setPracticing(false));
  }, [onStaged, addToast, go]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    const query = q.trim().toLowerCase();
    const tagQuery = query.startsWith('#') ? query.slice(1) : null;
    let list = posts.filter((p) => {
      if (category !== '전체' && p.category !== category) return false;
      if (!query) return true;
      if (tagQuery) return p.tags.some((t) => t.toLowerCase().includes(tagQuery));
      return (
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
    list = [...list].sort((a, b) =>
      sort === 'views' ? b.views - a.views : b.created_at.localeCompare(a.created_at),
    );
    return list;
  }, [posts, q, category, sort]);

  const selectedPost = posts?.find((p) => p.id === selected);

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold tracking-tight text-3xl flex items-center gap-3">
            커뮤니티
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-mist text-[11px] font-mono font-medium">SAMPLE DATA</span>
          </h1>
          <p className="mt-2 text-sm text-mist leading-relaxed max-w-xl">
            오류 해결 기록, 학습 결과, 데이터 정보를 나누는 공간입니다. 글과 수치는 데모용
            시드이지만 인용된 데이터셋·출처·코드는 모두 실재하며, 실습해보기 버튼으로
            Web IDE 워크스페이스에 바로 가져올 수 있습니다.
          </p>
        </div>
        {/* 검색 — #태그 또는 키워드 */}
        <label className="flex items-center gap-2.5 rounded-full border border-line bg-pit px-4 py-2.5 w-full sm:w-72 focus-within:border-gold/50 transition-colors">
          <Search className="w-4 h-4 text-dim shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="#해시태그 또는 키워드 검색"
            className="bg-transparent outline-none text-[13px] text-ink placeholder:text-dim w-full"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="검색어 지우기" className="text-dim hover:text-ink transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
      </div>

      {/* 필터 + 정렬 */}
      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="카테고리 필터">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`px-3.5 py-1.5 rounded-full text-[13px] transition-colors ${
                category === c ? 'bg-ink text-void font-semibold' : 'border border-line text-mist hover:text-ink hover:border-white/25'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-full border border-line p-0.5" role="group" aria-label="정렬">
          {[['views', '조회순'], ['latest', '최신순']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              aria-pressed={sort === id}
              className={`px-3.5 py-1.5 rounded-full text-[12px] transition-colors ${
                sort === id ? 'bg-ink text-void font-semibold' : 'text-mist hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-[13px] text-ember">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {!posts && !error && (
        <p className="mt-10 text-[13px] text-dim flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> 글을 불러오는 중…
        </p>
      )}

      {posts && filtered.length === 0 && (
        <div className="mt-10 rounded-3xl border border-line p-10 text-center">
          <p className="font-display font-bold text-lg">검색 결과가 없습니다</p>
          <p className="mt-2 text-[13px] text-mist">다른 키워드나 해시태그로 검색해 보세요.</p>
        </div>
      )}

      {/* 카드 그리드 — 카드 3단: 제목 / 대표 이미지 / 한 줄 요약 */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <article
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={() => openPost(p.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPost(p.id); } }}
            className="glass-card rounded-3xl p-5 cursor-pointer group hover:border-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-gold/75 flex flex-col gap-4"
          >
            {/* 1) 제목 */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${CATEGORY_CHIP[p.category]}`}>
                  {p.category}
                </span>
                {p.practice_available && (
                  <span className="font-mono text-[10px] text-gold flex items-center gap-1">
                    <Play className="w-3 h-3" /> 실습 가능
                  </span>
                )}
              </div>
              <h2 className="mt-2.5 font-display font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                {p.title}
              </h2>
            </div>

            {/* 2) 대표 이미지 */}
            <Cover post={p} />

            {/* 3) 한 줄 요약 + 메타 */}
            <div className="mt-auto">
              <p className="text-[13px] text-mist leading-relaxed truncate">{p.summary}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <MetaCounts post={p} liked={liked.has(p.id)} bookmarked={bookmarked.has(p.id)} />
                <span className="font-mono text-[10px] text-dim">{p.created_at}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          liked={liked.has(selectedPost.id)}
          bookmarked={bookmarked.has(selectedPost.id)}
          onToggle={toggle}
          onPractice={practice}
          practicing={practicing}
          onClose={() => setSelected(null)}
          onTag={(t) => setQ(`#${t}`)}
        />
      )}
    </div>
  );
}
