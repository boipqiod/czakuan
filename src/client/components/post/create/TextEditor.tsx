'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {convertToJpeg, imageSelector} from '@/lib/image';
import {uploadTempPostImage} from '@/server/actions/post.actions';
import {useEffect, useRef} from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  // 'list', // "list"는 "ordered"와 "bullet" 모두를 포함
  // 'bullet', // 이 형식을 지원
  'align',
  'image',
];

type TextEditorProps = {
  onChange: (content: string) => void;
  onAddImage: (imageUrl: string) => void;
  originalContent?: string;
};

const TextEditor = ({
  onChange,
  onAddImage,
  originalContent,
}: TextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: {
      container: [
        [{header: '1'}, {header: '2'}],
        [{size: []}],
        ['image'],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
          {list: 'ordered'},
          {list: 'bullet'},
          {align: ['center', 'right', 'start']},
        ],
      ],
      handlers: {
        image: () => imageHandler(quillRef.current!, onAddImage),
      },
    },
    clipboard: {
      matchVisual: false,
    },
  };

  useEffect(() => {
    if (originalContent) {
      quillRef.current?.getEditor().setContents(JSON.parse(originalContent));
    }
  }, []);

  return (
    <ReactQuill
      style={{
        height: '45svh',
        marginBottom: '70px',
      }}
      ref={quillRef}
      modules={modules}
      formats={formats}
      onChange={onChange}
    />
  );
};

const imageHandler = async (
  quill: ReactQuill,
  onAddImage: (imageUrl: string) => void,
) => {
  try {
    const file = await imageSelector();
    if (!file) return;
    const _file = await convertToJpeg(file);

    actionWrapper(() => uploadTempPostImage(_file), {
      success: res => {
        const {url} = res.data;
        const editor = quill.getEditor();
        const index = editor.getSelection()?.index ?? 0;
        editor.insertEmbed(index, 'image', url);
        editor.setSelection(index + 1, 0);
        onAddImage(url);
      },
      error: e => {
        alert('이미지 업로드에 실패했습니다.');
      },
    });
  } catch (e) {
    alert('이미지를 불러오는데 실패했습니다.');
  }
};

export default TextEditor;
