import { cn } from '../../../utils/cn'
import { ToolbarGroup } from './ToolbarGroup'
import { ToolbarButton } from './ToolbarButton'
import {
  Bold, Italic, Underline,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Indent, Outdent, MoreHorizontal, Type,
} from 'lucide-react'

export function Toolbar({ className, editor }) {
  if (!editor) return null

  return (
    <div
      className={cn(
        'flex items-center h-toolbar px-2',
        'bg-surface-toolbar border-b border-content-border shadow-toolbar',
        'overflow-x-auto scrollbar-hide',
        className,
      )}
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolbarGroup>
        <div className="flex items-center gap-1 px-1">
          <Type className="w-4 h-4 text-content-secondary" />
          <select
            onChange={(e) => {
              const value = e.target.value
              if (value === 'p') {
                editor.chain().focus().setParagraph().run()
              } else {
                const level = parseInt(value.replace('h', ''))
                editor.chain().focus().toggleHeading({ level }).run()
              }
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1'
              : editor.isActive('heading', { level: 2 }) ? 'h2'
              : editor.isActive('heading', { level: 3 }) ? 'h3'
              : 'p'
            }
            className="h-8 px-2 text-btn-label-sm text-content-primary bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="p">Normal Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          icon={<Bold />}
          aria-label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<Italic />}
          aria-label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<Underline />}
          aria-label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          icon={<span className="w-4 h-4 rounded-sm bg-highlight-yellow border border-content-border" />}
          aria-label="Highlight yellow"
          active={editor.isActive('highlight', { color: '#FEFCBF' })}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#FEFCBF' }).run()}
        />
        <ToolbarButton
          icon={<span className="w-4 h-4 rounded-sm bg-highlight-green border border-content-border" />}
          aria-label="Highlight green"
          active={editor.isActive('highlight', { color: '#C6F6D5' })}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#C6F6D5' }).run()}
        />
        <ToolbarButton
          icon={<span className="w-4 h-4 rounded-sm bg-highlight-orange border border-content-border" />}
          aria-label="Highlight orange"
          active={editor.isActive('highlight', { color: '#FEEBC8' })}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#FEEBC8' }).run()}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          icon={<List />}
          aria-label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={<ListOrdered />}
          aria-label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          icon={<AlignLeft />}
          aria-label="Align left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          icon={<AlignCenter />}
          aria-label="Align center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          icon={<AlignRight />}
          aria-label="Align right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          icon={<Indent />}
          aria-label="Indent"
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          disabled={!editor.can().sinkListItem('listItem')}
        />
        <ToolbarButton
          icon={<Outdent />}
          aria-label="Outdent"
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          disabled={!editor.can().liftListItem('listItem')}
        />
      </ToolbarGroup>

      <ToolbarGroup noDivider>
        <ToolbarButton
          icon={<MoreHorizontal />}
          aria-label="More options"
        />
      </ToolbarGroup>
    </div>
  )
}
