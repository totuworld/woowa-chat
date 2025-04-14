import { Box, ButtonGroup, HStack, Icon, IconButton, Tooltip } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiListUnordered,
  RiListOrdered,
  RiParagraph,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from 'react-icons/ri';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = function ({ value, onChange, placeholder, minHeight }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor: editorInstance }) => {
      // HTML을 그대로 전달하여 줄바꿈 등의 서식 보존
      const html = editorInstance.getHTML();
      onChange(html);
    },
  });

  // value prop이 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // 메뉴 버튼 클릭 핸들러들
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const setParagraph = useCallback(() => {
    editor?.chain().focus().setParagraph().run();
  }, [editor]);

  const undo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const redo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  return (
    <Box
      className="tiptap-editor"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      p="2"
      minH={minHeight}
      maxH="300px"
      overflow="auto"
      fontSize="sm"
      css={{
        '& .ProseMirror': {
          outline: 'none',
          minHeight,
          padding: '0.5rem',
        },
        '& .ProseMirror p.is-editor-empty:first-child::before': {
          content: 'attr(data-placeholder)',
          color: 'gray.500',
          float: 'left',
          pointerEvents: 'none',
          height: '0',
        },
      }}
    >
      {editor && (
        <HStack mb={2} spacing={1} borderBottom="1px solid" borderColor="gray.100" pb={2}>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Tooltip label="굵게">
              <IconButton
                icon={<Icon as={RiBold} />}
                aria-label="Bold"
                onClick={toggleBold}
                isActive={editor.isActive('bold')}
                colorScheme={editor.isActive('bold') ? 'blue' : 'gray'}
              />
            </Tooltip>
            <Tooltip label="기울임">
              <IconButton
                icon={<Icon as={RiItalic} />}
                aria-label="Italic"
                onClick={toggleItalic}
                isActive={editor.isActive('italic')}
                colorScheme={editor.isActive('italic') ? 'blue' : 'gray'}
              />
            </Tooltip>
            <Tooltip label="취소선">
              <IconButton
                icon={<Icon as={RiStrikethrough} />}
                aria-label="Strike"
                onClick={toggleStrike}
                isActive={editor.isActive('strike')}
                colorScheme={editor.isActive('strike') ? 'blue' : 'gray'}
              />
            </Tooltip>
          </ButtonGroup>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Tooltip label="글머리 기호 목록">
              <IconButton
                icon={<Icon as={RiListUnordered} />}
                aria-label="Bullet List"
                onClick={toggleBulletList}
                isActive={editor.isActive('bulletList')}
                colorScheme={editor.isActive('bulletList') ? 'blue' : 'gray'}
              />
            </Tooltip>
            <Tooltip label="번호 매기기 목록">
              <IconButton
                icon={<Icon as={RiListOrdered} />}
                aria-label="Ordered List"
                onClick={toggleOrderedList}
                isActive={editor.isActive('orderedList')}
                colorScheme={editor.isActive('orderedList') ? 'blue' : 'gray'}
              />
            </Tooltip>
            <Tooltip label="단락">
              <IconButton
                icon={<Icon as={RiParagraph} />}
                aria-label="Paragraph"
                onClick={setParagraph}
                colorScheme={editor.isActive('paragraph') ? 'blue' : 'gray'}
              />
            </Tooltip>
          </ButtonGroup>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Tooltip label="실행 취소">
              <IconButton icon={<Icon as={RiArrowGoBackLine} />} aria-label="Undo" onClick={undo} />
            </Tooltip>
            <Tooltip label="재실행">
              <IconButton icon={<Icon as={RiArrowGoForwardLine} />} aria-label="Redo" onClick={redo} />
            </Tooltip>
          </ButtonGroup>
        </HStack>
      )}
      <EditorContent editor={editor} />
    </Box>
  );
};

TiptapEditor.defaultProps = {
  placeholder: '질문이 몽글몽글 떠오른다면? 여기로!',
  minHeight: '5rem', // 편집 공간을 더 넓게 설정
};

export default TiptapEditor;
