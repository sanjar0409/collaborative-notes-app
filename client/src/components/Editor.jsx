import { useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import { TypingIndicator } from './ui/TypingIndicator';
import { RemoteCursor } from './RemoteCursor';
import { getCursorColor } from '../utils/cursorColors';

export default function Editor({ editor, typingUsers, remoteCursors = [], onCursorMove }) {
  useEffect(() => {
    if (!editor || !onCursorMove) return;

    const handleSelectionUpdate = ({ editor: ed }) => {
      const { view } = ed;
      const { from } = ed.state.selection;
      try {
        const coords = view.coordsAtPos(from);
        const editorRect = view.dom.getBoundingClientRect();
        onCursorMove({
          top: coords.top - editorRect.top,
          left: coords.left - editorRect.left,
        });
      } catch {
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => editor.off('selectionUpdate', handleSelectionUpdate);
  }, [editor, onCursorMove]);

  const typingNames = typingUsers?.filter(u => u).map(u => u.name) || [];

  return (
    <div className="relative flex-1 overflow-y-auto">
      <EditorContent
        editor={editor}
        className="editor-content p-5"
      />

      {remoteCursors.map((rc) => (
        <RemoteCursor
          key={rc.userId}
          name={rc.name}
          color={getCursorColor(rc.userId)}
          top={rc.cursor.top}
          left={rc.cursor.left}
        />
      ))}

      {typingNames.length > 0 && (
        <div className="absolute bottom-2 left-6">
          <TypingIndicator name={typingNames.join(', ')} />
        </div>
      )}
    </div>
  );
}
