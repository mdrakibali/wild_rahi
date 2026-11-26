'use client';

import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { sanitizeArticleHtml } from '../../lib/sanitizeHtml';
import { Select } from '../ui/Select';
import { readImageFileAsDataUrl, uploadImageFileToServer } from '../../lib/imageUpload';

type FigureLayout = 'standard' | 'wide' | 'full' | 'left' | 'right';

const EditorialFigure = Node.create({
  name: 'editorialFigure',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      caption: { default: '' },
      layout: { default: 'standard' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          if (el.closest('div[data-gallery="true"]')) return false;
          const img = el.querySelector('img');
          if (!img) return false;
          const figcaption = el.querySelector('figcaption');
          return {
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            caption: figcaption?.textContent?.trim() || '',
            layout: el.getAttribute('data-layout') || 'standard',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = String(HTMLAttributes.src || '');
    const alt = String(HTMLAttributes.alt || '');
    const caption = String(HTMLAttributes.caption || '');
    const layout = String(HTMLAttributes.layout || 'standard');

    const children: unknown[] = [['img', { src, alt }]];
    if (caption) {
      children.push(['figcaption', {}, caption]);
    }
    return ['figure', mergeAttributes({ 'data-layout': layout }), ...children] as never;
  },
});

interface GalleryPhotoInput {
  src: string;
  alt: string;
  caption: string;
}

const EditorialGallery = Node.create({
  name: 'editorialGallery',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [] as GalleryPhotoInput[],
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-gallery="true"]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const figures = Array.from(el.querySelectorAll('figure'));
          const items: GalleryPhotoInput[] = figures
            .map((fig) => {
              const img = fig.querySelector('img');
              const cap = fig.querySelector('figcaption');
              return {
                src: img?.getAttribute('src') || '',
                alt: img?.getAttribute('alt') || '',
                caption: cap?.textContent?.trim() || '',
              };
            })
            .filter((item) => Boolean(item.src));
          if (items.length === 0) return false;
          return { items };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const items = Array.isArray(HTMLAttributes.items)
      ? (HTMLAttributes.items as GalleryPhotoInput[])
      : [];
    const figureNodes = items.map((item) => {
      const figChildren: unknown[] = [['img', { src: item.src, alt: item.alt || '' }]];
      if (item.caption) {
        figChildren.push(['figcaption', {}, item.caption]);
      }
      return ['figure', {}, ...figChildren];
    });
    return ['div', mergeAttributes({ 'data-gallery': 'true' }), ...figureNodes] as never;
  },
});

interface ArticleRichEditorProps {
  value: string;
  onChange: (html: string, json: Record<string, unknown>) => void;
  title?: string;
}

type ActivePanel = null | 'link' | 'image' | 'gallery' | 'youtube';

export const ArticleRichEditor: React.FC<ArticleRichEditorProps> = ({
  value,
  onChange,
  title,
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const [linkUrl, setLinkUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [imgLayout, setImgLayout] = useState<FigureLayout>('wide');
  const [imgError, setImgError] = useState('');
  const [imgUploading, setImgUploading] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryPhotoInput[]>([
    { src: '', alt: '', caption: '' },
    { src: '', alt: '', caption: '' },
  ]);

  const [youtubeUrl, setYoutubeUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExtension.configure({
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your wildlife story, field encounters, and observations here...',
      }),
      EditorialFigure,
      EditorialGallery,
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML(), instance.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
        Initializing editorial editor...
      </div>
    );
  }

  const toolBtn = (active: boolean) =>
    `inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
      active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
    }`;

  const handleApplyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
    }
    setLinkUrl('');
    setActivePanel(null);
  };

  const uploadOrReadImage = async (file: File): Promise<string> => {
    try {
      const uploaded = await uploadImageFileToServer(file, 'stories/inline');
      return uploaded.imageUrl;
    } catch {
      return readImageFileAsDataUrl(file, 1600, 0.84);
    }
  };

  const handleImageFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setImgError('');
    setImgUploading(true);
    try {
      const url = await uploadOrReadImage(file);
      setImgSrc(url);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setImgUploading(false);
    }
  };

  const handleInsertFigure = () => {
    const trimmed = imgSrc.trim();
    if (!trimmed) {
      setImgError('Please upload an image or provide an image URL.');
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: 'editorialFigure',
        attrs: {
          src: trimmed,
          alt: imgAlt.trim() || imgCaption.trim() || 'Story photograph',
          caption: imgCaption.trim(),
          layout: imgLayout,
        },
      })
      .run();

    setImgSrc('');
    setImgAlt('');
    setImgCaption('');
    setImgError('');
    setActivePanel(null);
  };

  const handleGalleryFileSelect = async (idx: number, file: File | undefined) => {
    if (!file) return;
    try {
      const url = await uploadOrReadImage(file);
      setGalleryItems((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, src: url } : item))
      );
    } catch {
      // Ignore upload failure
    }
  };

  const handleInsertGallery = () => {
    const valid = galleryItems.filter((item) => item.src.trim().length > 0);
    if (valid.length < 2) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'editorialGallery',
        attrs: { items: valid },
      })
      .run();
    setGalleryItems([
      { src: '', alt: '', caption: '' },
      { src: '', alt: '', caption: '' },
    ]);
    setActivePanel(null);
  };

  const handleInsertYoutube = () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) return;
    editor.chain().focus().setYoutubeVideo({ src: trimmed }).run();
    setYoutubeUrl('');
    setActivePanel(null);
  };

  return (
    <div className="border border-border rounded-md bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border bg-secondary px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex flex-wrap items-center gap-1"
          role="toolbar"
          aria-label="Story formatting toolbar"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={toolBtn(editor.isActive('paragraph'))}
            title="Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={toolBtn(editor.isActive('heading', { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={toolBtn(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={toolBtn(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={toolBtn(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={toolBtn(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={toolBtn(editor.isActive('underline'))}
            title="Underline"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={toolBtn(editor.isActive('strike'))}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={toolBtn(editor.isActive({ textAlign: 'left' }))}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={toolBtn(editor.isActive({ textAlign: 'center' }))}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={toolBtn(editor.isActive({ textAlign: 'right' }))}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={toolBtn(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={toolBtn(editor.isActive('orderedList'))}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={toolBtn(editor.isActive('blockquote'))}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={toolBtn(false)}
            title="Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => {
              setLinkUrl(String(editor.getAttributes('link').href || ''));
              setActivePanel((p) => (p === 'link' ? null : 'link'));
            }}
            className={toolBtn(activePanel === 'link' || editor.isActive('link'))}
            title="Insert Link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActivePanel((p) => (p === 'image' ? null : 'image'))}
            className={toolBtn(activePanel === 'image')}
            title="Insert Inline Photo"
          >
            <ImageIcon className="w-3.5 h-3.5 mr-1" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => setActivePanel((p) => (p === 'gallery' ? null : 'gallery'))}
            className={toolBtn(activePanel === 'gallery')}
            title="Insert Photo Strip"
          >
            <Images className="w-3.5 h-3.5 mr-1" />
            Photos
          </button>
          <button
            type="button"
            onClick={() => setActivePanel((p) => (p === 'youtube' ? null : 'youtube'))}
            className={toolBtn(activePanel === 'youtube')}
            title="Embed YouTube Video"
          >
            <Video className="w-3.5 h-3.5 mr-1" />
            YouTube
          </button>

          <span className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className={toolBtn(false)}
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className={toolBtn(false)}
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className={toolBtn(false)}
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Edit / Preview Switch */}
        <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              mode === 'edit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PenLine className="w-3 h-3" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              mode === 'preview'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
        </div>
      </div>

      {activePanel === 'link' && (
        <div className="border-b border-border bg-secondary p-4 flex flex-wrap items-center gap-3">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.org"
            className="flex-1 min-w-[220px] bg-card border border-border rounded px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="rounded-md bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium cursor-pointer"
          >
            Apply Link
          </button>
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {activePanel === 'image' && (
        <div className="border-b border-border bg-secondary p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Insert Inline Photograph
            </p>
            <button type="button" onClick={() => setActivePanel(null)} aria-label="Close panel">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={imgSrc}
              onChange={(e) => setImgSrc(e.target.value)}
              placeholder="Image URL or upload file"
              className="bg-card border border-border rounded px-3 py-2 text-sm"
            />
            <label className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium cursor-pointer hover:bg-muted">
              <Upload className="w-3.5 h-3.5" />
              {imgUploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={imgUploading}
                onChange={(e) => handleImageFileSelect(e.target.files?.[0])}
              />
            </label>
            <input
              type="text"
              value={imgCaption}
              onChange={(e) => setImgCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="bg-card border border-border rounded px-3 py-2 text-sm"
            />
            <Select
              value={imgLayout}
              onChange={(e) => setImgLayout(e.target.value as FigureLayout)}
              options={[
                { value: 'standard', label: 'Standard Width' },
                { value: 'wide', label: 'Wide Layout' },
                { value: 'full', label: 'Full Width' },
              ]}
            />
          </div>
          {imgError && <p className="text-xs text-red-600">{imgError}</p>}
          <button
            type="button"
            onClick={handleInsertFigure}
            className="rounded-md bg-primary text-primary-foreground px-5 py-2 text-xs font-medium cursor-pointer"
          >
            Insert Photograph
          </button>
        </div>
      )}

      {activePanel === 'gallery' && (
        <div className="border-b border-border bg-secondary p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Insert Photo Strip (2–4 Photos)
            </p>
            <button type="button" onClick={() => setActivePanel(null)} aria-label="Close panel">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-2.5">
            {galleryItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={item.src}
                  onChange={(e) =>
                    setGalleryItems((prev) =>
                      prev.map((g, i) => (i === idx ? { ...g, src: e.target.value } : g))
                    )
                  }
                  placeholder={`Photo ${idx + 1} URL`}
                  className="md:col-span-6 bg-card border border-border rounded px-3 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) =>
                    setGalleryItems((prev) =>
                      prev.map((g, i) => (i === idx ? { ...g, caption: e.target.value } : g))
                    )
                  }
                  placeholder="Caption (optional)"
                  className="md:col-span-3 bg-card border border-border rounded px-3 py-1.5 text-xs"
                />
                <label className="md:col-span-3 inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs cursor-pointer hover:bg-muted">
                  <Upload className="w-3 h-3" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryFileSelect(idx, e.target.files?.[0])}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {galleryItems.length < 4 && (
              <button
                type="button"
                onClick={() =>
                  setGalleryItems((prev) => [...prev, { src: '', alt: '', caption: '' }])
                }
                className="rounded-md border border-border bg-card px-4 py-1.5 text-xs font-medium cursor-pointer"
              >
                + Add Photo
              </button>
            )}
            <button
              type="button"
              onClick={handleInsertGallery}
              className="rounded-md bg-primary text-primary-foreground px-5 py-1.5 text-xs font-medium cursor-pointer"
            >
              Insert Photo Strip
            </button>
          </div>
        </div>
      )}

      {activePanel === 'youtube' && (
        <div className="border-b border-border bg-secondary p-4 flex flex-wrap items-center gap-3">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 min-w-[220px] bg-card border border-border rounded px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleInsertYoutube}
            className="rounded-md bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium cursor-pointer"
          >
            Embed YouTube
          </button>
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'edit' ? (
        <div className="tiptap-editor-content article-prose px-6 py-5 bg-card min-h-[260px]">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div className="px-6 sm:px-10 py-8 bg-card">
          {title && (
            <h2 className="text-3xl font-serif font-semibold tracking-tight text-foreground mb-6 pb-4 border-b border-border">
              {title}
            </h2>
          )}
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(editor.getHTML()) }}
          />
        </div>
      )}
    </div>
  );
};
